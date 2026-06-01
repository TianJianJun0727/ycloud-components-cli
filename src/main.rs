use serde_json::{json, Map, Value};
use std::env;
use std::fs;
use std::io::{self, BufRead, Write};
use std::path::{Path, PathBuf};
use std::process;
use std::time::{SystemTime, UNIX_EPOCH};

const CLI_VERSION: &str = env!("CARGO_PKG_VERSION");
const COMPONENT_PACKAGE_NAME: &str = "@ycloud/components";
const DEFAULT_METADATA_URL: &str = "https://ui.ycloud.com/metadata.json";

#[derive(Debug)]
struct CliError {
    code: &'static str,
    message: String,
    suggestion: Option<String>,
}

impl CliError {
    fn new(code: &'static str, message: impl Into<String>) -> Self {
        let message = message.into();
        let suggestion = match code {
            "COMPONENT_NOT_FOUND" => Some(
                "Run `ycc list --format json` to see all available component names.".to_string(),
            ),
            _ => None,
        };
        Self {
            code,
            message,
            suggestion,
        }
    }

    fn with_suggestion(
        code: &'static str,
        message: impl Into<String>,
        suggestion: impl Into<String>,
    ) -> Self {
        Self {
            code,
            message: message.into(),
            suggestion: Some(suggestion.into()),
        }
    }

    fn to_json(&self) -> Value {
        let mut value = json!({
            "error": true,
            "code": self.code,
            "message": self.message,
        });
        if let Some(suggestion) = &self.suggestion {
            value["suggestion"] = Value::String(suggestion.clone());
        }
        value
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum OutputFormat {
    Json,
    Table,
    Markdown,
    Text,
}

impl OutputFormat {
    fn parse(value: Option<&str>) -> Self {
        match value {
            Some("table") => Self::Table,
            Some("markdown") => Self::Markdown,
            Some("text") => Self::Text,
            _ => Self::Json,
        }
    }
}

#[derive(Debug)]
struct ParsedArgs {
    command: String,
    positionals: Vec<String>,
    format: OutputFormat,
    format_was_set: bool,
    force: bool,
}

fn main() {
    let args = env::args().skip(1).collect::<Vec<_>>();
    let error_format = parse_error_format(&args);

    if let Err(err) = run(args) {
        print_error(&err, error_format);
        process::exit(1);
    }
}

fn run(args: Vec<String>) -> Result<(), CliError> {
    let parsed = parse_args(args)?;

    match parsed.command.as_str() {
        "list" => output(&list_components()?, parsed.format),
        "info" => {
            let component_name = require_arg(&parsed.positionals, 0, "component")?;
            output(&load_component(component_name)?, parsed.format)
        }
        "demo" => {
            let component_name = require_arg(&parsed.positionals, 0, "component")?;
            let demo_name = parsed.positionals.get(1).map(String::as_str);
            output(
                &component_demo_code(component_name, demo_name)?,
                parsed.format,
            )
        }
        "doc" => {
            let component_name = require_arg(&parsed.positionals, 0, "component")?;
            output(&component_doc(component_name)?, parsed.format)
        }
        "meta" => output(&meta_info()?, parsed.format),
        "config" => handle_config(&parsed),
        "skill" => handle_skill(&parsed),
        "mcp" => run_mcp_server(),
        "--help" | "-h" | "help" => {
            print_help();
            Ok(())
        }
        "--version" | "-v" | "version" => {
            println!("{CLI_VERSION}");
            Ok(())
        }
        _ => Err(CliError::new(
            "UNKNOWN_ERROR",
            format!("Unknown command: {}", parsed.command),
        )),
    }
}

fn parse_error_format(args: &[String]) -> OutputFormat {
    let mut index = 0;
    while index < args.len() {
        match args[index].as_str() {
            "--format" | "-f" => {
                return OutputFormat::parse(args.get(index + 1).map(String::as_str))
            }
            _ => index += 1,
        }
    }
    if args.first().map(String::as_str) == Some("skill") {
        return OutputFormat::Text;
    }
    OutputFormat::Json
}

fn parse_args(args: Vec<String>) -> Result<ParsedArgs, CliError> {
    if args.is_empty() {
        return Err(CliError::new(
            "UNKNOWN_ERROR",
            "You need to specify a command",
        ));
    }

    let command = args[0].clone();
    let mut positionals = Vec::new();
    let mut format = OutputFormat::Json;
    let mut format_was_set = false;
    let mut force = false;
    let mut index = 1;

    while index < args.len() {
        match args[index].as_str() {
            "--format" | "-f" => {
                index += 1;
                format = OutputFormat::parse(args.get(index).map(String::as_str));
                format_was_set = true;
            }
            "--force" | "-F" => {
                force = true;
            }
            "--help" | "-h" => {
                print_help();
                process::exit(0);
            }
            value => {
                positionals.push(value.to_string());
            }
        }
        index += 1;
    }

    Ok(ParsedArgs {
        command,
        positionals,
        format,
        format_was_set,
        force,
    })
}

fn require_arg<'a>(
    positionals: &'a [String],
    index: usize,
    name: &str,
) -> Result<&'a str, CliError> {
    positionals.get(index).map(String::as_str).ok_or_else(|| {
        CliError::new(
            "UNKNOWN_ERROR",
            format!("Missing required argument: {name}"),
        )
    })
}

fn load_metadata() -> Result<Value, CliError> {
    if env::var("YCC_USE_LOCAL_META_DATA").unwrap_or_default() == "true" {
        return read_json_file(&metadata_example_file());
    }

    if let Some(cached) = read_cache() {
        let _ = refresh_cache();
        return Ok(cached);
    }

    let metadata = fetch_remote_metadata()?;
    write_cache(&metadata)?;
    Ok(metadata)
}

fn metadata_example_file() -> PathBuf {
    let manifest_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("metadata.example.json");
    if manifest_path.exists() {
        return manifest_path;
    }

    if let Ok(cwd) = env::current_dir() {
        let cwd_path = cwd.join("metadata.example.json");
        if cwd_path.exists() {
            return cwd_path;
        }
    }

    package_root().join("metadata.example.json")
}

fn read_json_file(path: &Path) -> Result<Value, CliError> {
    let content = fs::read_to_string(path).map_err(|err| {
        CliError::new(
            "METADATA_LOAD_ERROR",
            format!("Failed to read metadata file {}: {err}", path.display()),
        )
    })?;
    serde_json::from_str(&content).map_err(|err| {
        CliError::new(
            "METADATA_LOAD_ERROR",
            format!("Failed to parse metadata file {}: {err}", path.display()),
        )
    })
}

fn fetch_remote_metadata() -> Result<Value, CliError> {
    let url = metadata_url();
    let response = ureq::get(&url).call().map_err(|_| {
        CliError::with_suggestion(
            "METADATA_LOAD_ERROR",
            "Failed to load metadata from remote server",
            "Please check your network connection and try again.",
        )
    })?;
    response.into_json::<Value>().map_err(|err| {
        CliError::new(
            "METADATA_LOAD_ERROR",
            format!("Failed to parse remote metadata: {err}"),
        )
    })
}

fn metadata_url() -> String {
    env::var("YCC_META_DATA_URL")
        .ok()
        .filter(|url| !url.trim().is_empty())
        .or_else(configured_metadata_url)
        .unwrap_or_else(|| DEFAULT_METADATA_URL.to_string())
}

fn configured_metadata_url() -> Option<String> {
    read_config()
        .ok()
        .and_then(|config| {
            config
                .get("metadataUrl")
                .and_then(Value::as_str)
                .map(str::trim)
                .map(str::to_string)
        })
        .filter(|url| !url.is_empty())
}

fn cache_dir() -> PathBuf {
    config_dir().join("cache")
}

fn config_file() -> PathBuf {
    config_dir().join("config.json")
}

fn config_dir() -> PathBuf {
    config_dir_from_values(
        env::var_os("XDG_CONFIG_HOME").map(PathBuf::from),
        env::var_os("HOME").map(PathBuf::from),
        env::var_os("USERPROFILE").map(PathBuf::from),
        env::temp_dir(),
    )
}

fn config_dir_from_values(
    xdg_config_home: Option<PathBuf>,
    home: Option<PathBuf>,
    userprofile: Option<PathBuf>,
    temp_dir: PathBuf,
) -> PathBuf {
    if let Some(config_home) = xdg_config_home {
        return config_home.join("ycc");
    }
    if let Some(home) = home {
        return home.join(".config").join("ycc");
    }
    if let Some(profile) = userprofile {
        return profile.join(".config").join("ycc");
    }
    temp_dir.join("ycc")
}

fn metadata_cache_file() -> PathBuf {
    cache_dir().join("metadata.json")
}

fn legacy_metadata_cache_file() -> Option<PathBuf> {
    env::var_os("HOME").map(|home| {
        PathBuf::from(home)
            .join(".ycc")
            .join("cache")
            .join("metadata.json")
    })
}

fn read_cache() -> Option<Value> {
    let content = fs::read_to_string(metadata_cache_file())
        .or_else(|_| {
            legacy_metadata_cache_file()
                .map(fs::read_to_string)
                .transpose()
                .map(|content| content.unwrap_or_default())
        })
        .ok()?;
    serde_json::from_str(&content).ok()
}

fn read_config() -> Result<Value, CliError> {
    let path = config_file();
    if !path.exists() {
        return Ok(json!({}));
    }
    read_json_file(&path)
}

fn write_config(config: &Value) -> Result<(), CliError> {
    fs::create_dir_all(config_dir()).map_err(|err| {
        CliError::new(
            "CONFIG_ERROR",
            format!("Failed to create config dir: {err}"),
        )
    })?;
    fs::write(config_file(), serde_json::to_vec_pretty(config).unwrap()).map_err(|err| {
        CliError::new(
            "CONFIG_ERROR",
            format!("Failed to write config file: {err}"),
        )
    })
}

fn refresh_cache() -> Result<(), CliError> {
    if let Ok(metadata) = fetch_remote_metadata() {
        let _ = write_cache(&metadata);
    }
    Ok(())
}

fn write_cache(metadata: &Value) -> Result<(), CliError> {
    fs::create_dir_all(cache_dir()).map_err(|err| {
        CliError::new(
            "METADATA_LOAD_ERROR",
            format!("Failed to create cache dir: {err}"),
        )
    })?;
    let temp_file = env::temp_dir().join(format!("ycc-metadata-{}.json", timestamp_ms()));
    fs::write(&temp_file, serde_json::to_vec(metadata).unwrap()).map_err(|err| {
        CliError::new(
            "METADATA_LOAD_ERROR",
            format!("Failed to write cache file: {err}"),
        )
    })?;
    fs::rename(temp_file, metadata_cache_file()).map_err(|err| {
        CliError::new(
            "METADATA_LOAD_ERROR",
            format!("Failed to update cache file: {err}"),
        )
    })
}

fn timestamp_ms() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}

fn components(metadata: &Value) -> Vec<Value> {
    metadata
        .get("components")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default()
}

fn list_components() -> Result<Value, CliError> {
    let metadata = load_metadata()?;
    let list = components(&metadata)
        .into_iter()
        .map(|component| {
            let mut item = Map::new();
            for key in ["name", "nameZh", "description", "since"] {
                if let Some(value) = component.get(key) {
                    item.insert(key.to_string(), value.clone());
                }
            }
            Value::Object(item)
        })
        .collect::<Vec<_>>();
    Ok(Value::Array(list))
}

fn load_component(component_name: &str) -> Result<Value, CliError> {
    let metadata = load_metadata()?;
    components(&metadata)
        .into_iter()
        .find(|component| component.get("name").and_then(Value::as_str) == Some(component_name))
        .ok_or_else(|| {
            CliError::new(
                "COMPONENT_NOT_FOUND",
                format!("Component {component_name} not found in metadata"),
            )
        })
}

fn component_demo_code(component_name: &str, demo_name: Option<&str>) -> Result<Value, CliError> {
    let component = load_component(component_name)?;
    let demos = component
        .get("demos")
        .and_then(Value::as_array)
        .ok_or_else(|| CliError::new("COMPONENTS_DEMO_NOT_FOUND", "Component has no demos"))?;

    if let Some(demo_name) = demo_name {
        let demo = demos
            .iter()
            .find(|demo| demo.get("name").and_then(Value::as_str) == Some(demo_name))
            .ok_or_else(|| {
                CliError::new(
                    "COMPONENTS_DEMO_NOT_FOUND",
                    format!("Demo {demo_name} not found for {component_name}"),
                )
            })?;
        return Ok(demo.get("code").cloned().unwrap_or(Value::Null));
    }

    Ok(Value::Array(
        demos
            .iter()
            .map(|demo| demo.get("code").cloned().unwrap_or(Value::Null))
            .collect(),
    ))
}

fn component_doc(component_name: &str) -> Result<Value, CliError> {
    let component = load_component(component_name)?;
    component.get("doc").cloned().ok_or_else(|| {
        CliError::new(
            "DOCUMENT_NOT_FOUND",
            format!("Documentation not found for component {component_name}"),
        )
    })
}

fn meta_info() -> Result<Value, CliError> {
    let metadata = load_metadata()?;
    Ok(json!({
        "version": metadata.get("version").cloned().unwrap_or(Value::Null),
        "muiVersion": metadata.get("muiVersion").cloned().unwrap_or(Value::Null),
    }))
}

fn handle_config(parsed: &ParsedArgs) -> Result<(), CliError> {
    match (
        parsed.positionals.first().map(String::as_str),
        parsed.positionals.get(1).map(String::as_str),
    ) {
        (Some("get"), Some(key)) if is_metadata_url_key(key) => output(
            &json!({
                "metadataUrl": metadata_url(),
                "configFile": config_file(),
            }),
            parsed.format,
        ),
        (Some("set"), Some(key)) if is_metadata_url_key(key) => {
            let value = require_arg(&parsed.positionals, 2, "value")?;
            let mut config = read_config()?;
            config["metadataUrl"] = Value::String(value.to_string());
            write_config(&config)?;
            output(
                &json!({
                    "metadataUrl": value,
                    "configFile": config_file(),
                }),
                parsed.format,
            )
        }
        _ => Err(CliError::new(
            "UNKNOWN_ERROR",
            "Only `ycc config get metadataUrl` and `ycc config set metadataUrl <url>` are supported",
        )),
    }
}

fn is_metadata_url_key(key: &str) -> bool {
    matches!(
        key,
        "metadataUrl" | "metadata-url" | "metaSource" | "meta-source"
    )
}

fn handle_skill(parsed: &ParsedArgs) -> Result<(), CliError> {
    if parsed.positionals.first().map(String::as_str) != Some("install") {
        return Err(CliError::new(
            "UNKNOWN_ERROR",
            "Only `ycc skill install [targetDir]` is supported",
        ));
    }

    let target_arg = parsed.positionals.get(1).map(String::as_str);
    let targets = resolve_install_targets(target_arg)?;
    let mut results = Vec::new();

    for target in targets {
        results.push(install_builtin_skills(&target, parsed.force)?);
    }

    let payload = json!({
        "targets": results,
        "force": parsed.force,
        "message": if results.len() == 1 {
            format!("Installed built-in skills into {}", results[0]["targetDir"].as_str().unwrap_or_default())
        } else {
            format!("Installed built-in skills into {} target directories", results.len())
        },
    });

    let output_format = if parsed.format_was_set {
        parsed.format
    } else {
        OutputFormat::Text
    };

    if output_format == OutputFormat::Json {
        output(&payload, output_format)
    } else {
        println!("✅ Skill installation complete.");
        for target in payload["targets"].as_array().unwrap_or(&Vec::new()) {
            println!(
                "Location: {}",
                target["targetDir"].as_str().unwrap_or_default()
            );
            if let Some(installed) = target["installed"].as_array() {
                if !installed.is_empty() {
                    let names = installed
                        .iter()
                        .filter_map(Value::as_str)
                        .collect::<Vec<_>>()
                        .join(", ");
                    println!("Added: {names}");
                }
            }
        }
        Ok(())
    }
}

fn normalize_explicit_target_dir(target_dir: &str) -> PathBuf {
    let path = PathBuf::from(target_dir);
    let resolved = if path.is_absolute() {
        path
    } else {
        env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(path)
    };
    let trimmed = target_dir.trim_end_matches(['/', '\\']);
    let raw_base = Path::new(if trimmed.is_empty() {
        target_dir
    } else {
        trimmed
    })
    .file_name()
    .and_then(|name| name.to_str());
    let resolved_base = resolved.file_name().and_then(|name| name.to_str());

    if matches!(raw_base, Some(".") | Some(".."))
        || matches!(resolved_base, Some(".codex") | Some(".claude"))
    {
        return resolved.join("skills");
    }

    resolved
}

fn resolve_install_targets(target_dir: Option<&str>) -> Result<Vec<PathBuf>, CliError> {
    if let Some(target_dir) = target_dir {
        return Ok(vec![normalize_explicit_target_dir(target_dir)]);
    }

    let cwd = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let targets = [".codex", ".claude"]
        .into_iter()
        .map(|dir| cwd.join(dir))
        .filter(|path| path.is_dir())
        .map(|path| path.join("skills"))
        .collect::<Vec<_>>();

    if targets.is_empty() {
        return Err(CliError::with_suggestion(
            "SKILL_TARGET_NOT_FOUND",
            "No .codex or .claude directory found in the current project.",
            "Create .codex or .claude in the project root, or run `ycc skill install <targetDir>`.",
        ));
    }

    Ok(targets)
}

fn install_builtin_skills(target_dir: &Path, force: bool) -> Result<Value, CliError> {
    let source_root = builtin_skills_dir()?;
    fs::create_dir_all(target_dir).map_err(|err| {
        CliError::new(
            "SKILL_TARGET_NOT_FOUND",
            format!(
                "Failed to create target directory {}: {err}",
                target_dir.display()
            ),
        )
    })?;

    let mut installed = Vec::new();
    let mut skipped = Vec::new();

    for entry in fs::read_dir(&source_root).map_err(|err| {
        CliError::new(
            "SKILL_SOURCE_NOT_FOUND",
            format!("Failed to read built-in skills directory: {err}"),
        )
    })? {
        let entry = entry.map_err(|err| {
            CliError::new(
                "SKILL_SOURCE_NOT_FOUND",
                format!("Failed to read built-in skill entry: {err}"),
            )
        })?;
        if !entry.path().is_dir() {
            continue;
        }

        let skill_name = entry.file_name().to_string_lossy().to_string();
        let target_skill_dir = target_dir.join(&skill_name);

        if target_skill_dir.exists() {
            if !force {
                skipped.push(Value::String(skill_name));
                continue;
            }
            fs::remove_dir_all(&target_skill_dir).map_err(|err| {
                CliError::new(
                    "SKILL_TARGET_NOT_FOUND",
                    format!(
                        "Failed to remove existing skill {}: {err}",
                        target_skill_dir.display()
                    ),
                )
            })?;
        }

        copy_dir(&entry.path(), &target_skill_dir)?;
        installed.push(Value::String(skill_name));
    }

    Ok(json!({
        "targetDir": target_dir.to_string_lossy(),
        "installed": installed,
        "skipped": skipped,
        "force": force,
    }))
}

fn builtin_skills_dir() -> Result<PathBuf, CliError> {
    let candidates = [
        package_root().join("skills"),
        env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join("skills"),
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("skills"),
    ];

    candidates
        .into_iter()
        .find(|path| path.is_dir())
        .ok_or_else(|| {
            CliError::new(
                "SKILL_SOURCE_NOT_FOUND",
                "Built-in skills directory not found",
            )
        })
}

fn package_root() -> PathBuf {
    let exe = env::current_exe().unwrap_or_else(|_| PathBuf::from("."));
    let exe_dir = exe.parent().unwrap_or_else(|| Path::new("."));
    if exe_dir.file_name().and_then(|name| name.to_str()) == Some("dist") {
        return exe_dir.parent().unwrap_or(exe_dir).to_path_buf();
    }
    exe_dir.to_path_buf()
}

fn copy_dir(source: &Path, target: &Path) -> Result<(), CliError> {
    fs::create_dir_all(target).map_err(|err| {
        CliError::new(
            "SKILL_TARGET_NOT_FOUND",
            format!("Failed to create directory {}: {err}", target.display()),
        )
    })?;

    for entry in fs::read_dir(source).map_err(|err| {
        CliError::new(
            "SKILL_SOURCE_NOT_FOUND",
            format!("Failed to read directory {}: {err}", source.display()),
        )
    })? {
        let entry = entry.map_err(|err| {
            CliError::new(
                "SKILL_SOURCE_NOT_FOUND",
                format!("Failed to read entry: {err}"),
            )
        })?;
        let source_path = entry.path();
        let target_path = target.join(entry.file_name());
        if source_path.is_dir() {
            copy_dir(&source_path, &target_path)?;
        } else {
            fs::copy(&source_path, &target_path).map_err(|err| {
                CliError::new(
                    "SKILL_TARGET_NOT_FOUND",
                    format!(
                        "Failed to copy {} to {}: {err}",
                        source_path.display(),
                        target_path.display()
                    ),
                )
            })?;
        }
    }

    Ok(())
}

fn run_mcp_server() -> Result<(), CliError> {
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let line = line.map_err(|err| CliError::new("UNKNOWN_ERROR", err.to_string()))?;
        if line.trim().is_empty() {
            continue;
        }
        let request: Value = serde_json::from_str(&line)
            .map_err(|err| CliError::new("UNKNOWN_ERROR", format!("Invalid JSON-RPC: {err}")))?;
        let response = handle_mcp_request(&request);
        println!("{}", serde_json::to_string(&response).unwrap());
        io::stdout().flush().ok();
    }
    Ok(())
}

fn handle_mcp_request(request: &Value) -> Value {
    let id = request.get("id").cloned().unwrap_or(Value::Null);
    match request
        .get("method")
        .and_then(Value::as_str)
        .unwrap_or_default()
    {
        "initialize" => json!({
            "jsonrpc": "2.0",
            "id": id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": { "tools": {} },
                "serverInfo": { "name": "ycc-server", "version": CLI_VERSION }
            }
        }),
        "tools/list" => json!({
            "result": {
                "tools": [
                    {
                        "name": "ycc_list",
                        "description": "List all available @ycloud/components with their names and descriptions",
                        "inputSchema": { "type": "object", "properties": {} },
                        "execution": { "taskSupport": "forbidden" }
                    },
                    {
                        "name": "ycc_info",
                        "description": "Get component properties, usage guidelines, and documentation for a specific @ycloud/components component",
                        "inputSchema": {
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "component": {
                                    "type": "string",
                                    "description": "Component name (e.g., Button, Input)"
                                }
                            },
                            "required": ["component"]
                        },
                        "execution": { "taskSupport": "forbidden" }
                    },
                    {
                        "name": "ycc_demo",
                        "description": "Get demo code examples for a specific @ycloud/components component. Returns all demos if demoName is not specified.",
                        "inputSchema": {
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "component": {
                                    "type": "string",
                                    "description": "Component name (e.g., Button, Input)"
                                },
                                "demoName": {
                                    "description": "Specific demo name to retrieve (optional)",
                                    "type": "string"
                                }
                            },
                            "required": ["component"]
                        },
                        "execution": { "taskSupport": "forbidden" }
                    },
                    {
                        "name": "ycc_doc",
                        "description": "Get full documentation for a specific @ycloud/components component. Supports English and Chinese.",
                        "inputSchema": {
                            "$schema": "http://json-schema.org/draft-07/schema#",
                            "type": "object",
                            "properties": {
                                "component": {
                                    "type": "string",
                                    "description": "Component name (e.g., Button, Input)"
                                }
                            },
                            "required": ["component"]
                        },
                        "execution": { "taskSupport": "forbidden" }
                    }
                ]
            },
            "jsonrpc": "2.0",
            "id": id
        }),
        "tools/call" => {
            let params = request.get("params").cloned().unwrap_or(Value::Null);
            let name = params
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or_default();
            let args = params
                .get("arguments")
                .cloned()
                .unwrap_or_else(|| json!({}));
            match call_mcp_tool(name, &args) {
                Ok(data) => json!({
                    "result": { "content": [{ "type": "text", "text": serde_json::to_string_pretty(&data).unwrap() }] },
                    "jsonrpc": "2.0",
                    "id": id
                }),
                Err(err) => json!({
                    "result": { "content": [{ "type": "text", "text": serde_json::to_string_pretty(&err.to_json()).unwrap() }], "isError": true },
                    "jsonrpc": "2.0",
                    "id": id
                }),
            }
        }
        "notifications/initialized" => Value::Null,
        _ => json!({
            "jsonrpc": "2.0",
            "id": id,
            "error": { "code": -32601, "message": "Method not found" }
        }),
    }
}

fn call_mcp_tool(name: &str, args: &Value) -> Result<Value, CliError> {
    match name {
        "ycc_list" => list_components(),
        "ycc_info" => {
            let component = args
                .get("component")
                .and_then(Value::as_str)
                .ok_or_else(|| CliError::new("UNKNOWN_ERROR", "Missing component"))?;
            load_component(component)
        }
        "ycc_demo" => {
            let component = args
                .get("component")
                .and_then(Value::as_str)
                .ok_or_else(|| CliError::new("UNKNOWN_ERROR", "Missing component"))?;
            let demo_name = args.get("demoName").and_then(Value::as_str);
            component_demo_code(component, demo_name)
        }
        "ycc_doc" => {
            let component = args
                .get("component")
                .and_then(Value::as_str)
                .ok_or_else(|| CliError::new("UNKNOWN_ERROR", "Missing component"))?;
            component_doc(component)
        }
        _ => Err(CliError::new(
            "UNKNOWN_ERROR",
            format!("Unknown tool: {name}"),
        )),
    }
}

fn output(data: &Value, format: OutputFormat) -> Result<(), CliError> {
    match format {
        OutputFormat::Json => {
            println!("{}", serde_json::to_string_pretty(data).unwrap());
        }
        OutputFormat::Markdown => output_markdown(data),
        OutputFormat::Text => output_text(data),
        OutputFormat::Table => output_text(data),
    }
    Ok(())
}

fn output_markdown(data: &Value) {
    if let Some(rows) = data.as_array() {
        if let Some(first) = rows.first().and_then(Value::as_object) {
            let keys = first.keys().cloned().collect::<Vec<_>>();
            println!("| {} |", keys.join(" | "));
            println!(
                "| {} |",
                keys.iter().map(|_| "---").collect::<Vec<_>>().join(" | ")
            );
            for row in rows {
                println!(
                    "| {} |",
                    keys.iter()
                        .map(|key| value_to_cell(row.get(key).unwrap_or(&Value::Null)))
                        .collect::<Vec<_>>()
                        .join(" | ")
                );
            }
            return;
        }
    }

    if let Some(object) = data.as_object() {
        println!("| Key | Value |");
        println!("| --- | --- |");
        for (key, value) in object {
            println!("| {key} | {} |", value_to_cell(value));
        }
        return;
    }

    println!("{}", value_to_cell(data));
}

fn output_text(data: &Value) {
    if let Some(text) = data.as_str() {
        println!("{text}");
        return;
    }
    if let Some(items) = data.as_array() {
        for item in items {
            println!("{}", value_to_cell(item));
        }
        return;
    }
    if let Some(object) = data.as_object() {
        for (key, value) in object {
            println!("{key}: {}", value_to_cell(value));
        }
        return;
    }
    println!("{}", value_to_cell(data));
}

fn value_to_cell(value: &Value) -> String {
    match value {
        Value::String(text) => text.clone(),
        Value::Null => String::new(),
        _ => value.to_string(),
    }
}

fn print_error(err: &CliError, format: OutputFormat) {
    if format == OutputFormat::Json {
        eprintln!("{}", serde_json::to_string_pretty(&err.to_json()).unwrap());
    } else {
        eprintln!("【Error】: {}", err.message);
        if let Some(suggestion) = &err.suggestion {
            eprintln!("【Suggestion】: {suggestion}");
        }
    }
}

fn print_help() {
    println!("CLI tool for {COMPONENT_PACKAGE_NAME} documentation");
    println!();
    println!("Commands:");
    println!("  ycc list                         List all components");
    println!("  ycc info <component>             Show component properties");
    println!("  ycc demo <component> [demoName]  Get component demo code");
    println!("  ycc meta                         Show metadata info (version, muiVersion)");
    println!("  ycc config get metadataUrl       Show the effective metadata source");
    println!("  ycc config set metadataUrl <url> Configure the metadata source");
    println!("  ycc doc <component>              Get full documentation for a component");
    println!("  ycc mcp                          Start MCP (Model Context Protocol) server for");
    println!("                                   AI assistant integration");
    println!("  ycc skill install [targetDir]    Install built-in skills to a local directory");
    println!();
    println!("Options:");
    println!("  -v, --version  Show version number                                   [boolean]");
    println!("      --help     Show help                                             [boolean]");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_dir_prefers_xdg_config_home() {
        let dir = config_dir_from_values(
            Some(PathBuf::from("/tmp/xdg")),
            Some(PathBuf::from("/tmp/home")),
            Some(PathBuf::from("/tmp/profile")),
            PathBuf::from("/tmp/fallback"),
        );

        assert_eq!(dir, PathBuf::from("/tmp/xdg/ycc"));
    }

    #[test]
    fn config_dir_uses_home_config_dir() {
        let dir = config_dir_from_values(
            None,
            Some(PathBuf::from("/tmp/home")),
            Some(PathBuf::from("/tmp/profile")),
            PathBuf::from("/tmp/fallback"),
        );

        assert_eq!(dir, PathBuf::from("/tmp/home/.config/ycc"));
    }

    #[test]
    fn config_dir_uses_userprofile_when_home_is_missing() {
        let dir = config_dir_from_values(
            None,
            None,
            Some(PathBuf::from("/tmp/profile")),
            PathBuf::from("/tmp/fallback"),
        );

        assert_eq!(dir, PathBuf::from("/tmp/profile/.config/ycc"));
    }
}
