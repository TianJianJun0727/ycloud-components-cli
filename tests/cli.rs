use assert_cmd::Command;
use predicates::prelude::*;
use serde_json::Value;
use std::fs;
use tempfile::tempdir;

fn command() -> Command {
    let mut cmd = Command::cargo_bin("ycc").expect("binary exists");
    cmd.env("YCC_USE_LOCAL_META_DATA", "true")
        .env("YCC_SKIP_UPDATE_CHECK", "true");
    cmd
}

#[test]
fn meta_outputs_version_and_mui_version_as_json() {
    let output = command()
        .arg("meta")
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let value: Value = serde_json::from_slice(&output).expect("valid json");

    assert_eq!(value["version"], "0.1.31");
    assert_eq!(value["muiVersion"], "7.3.5");
}

#[test]
fn list_outputs_component_summaries() {
    let output = command()
        .arg("list")
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let value: Value = serde_json::from_slice(&output).expect("valid json");
    let components = value.as_array().expect("component list");

    assert!(components.iter().any(|component| {
        component["name"] == "ArrowLinkButton"
            && component.get("props").is_none()
            && component.get("demos").is_none()
    }));
}

#[test]
fn demo_outputs_named_demo_code() {
    command()
        .args(["demo", "ArrowLinkButton", "basicArrowLinkButton"])
        .assert()
        .success()
        .stdout(predicate::str::contains("BasicArrowLinkButtonDemo"));
}

#[test]
fn missing_component_returns_json_error() {
    command()
        .args(["info", "MissingComponent", "--format", "json"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("COMPONENT_NOT_FOUND"));
}

#[test]
fn missing_component_respects_text_error_format() {
    command()
        .args(["info", "MissingComponent", "--format", "text"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("【Error】:"))
        .stderr(predicate::str::contains("COMPONENT_NOT_FOUND").not());
}

#[test]
fn skill_install_copies_builtin_skills_to_explicit_target() {
    let temp_dir = tempdir().expect("temp dir");
    let target = temp_dir.path().join(".codex");

    command()
        .args([
            "skill",
            "install",
            target.to_str().expect("utf8 path"),
            "--format",
            "json",
        ])
        .assert()
        .success();

    let installed_skill = target
        .join("skills")
        .join("ycloud-components")
        .join("SKILL.md");
    assert!(fs::metadata(installed_skill).is_ok());
}

#[test]
fn skill_install_defaults_to_text_output() {
    let temp_dir = tempdir().expect("temp dir");
    let target = temp_dir.path().join(".codex");

    command()
        .args([
            "skill",
            "install",
            target.to_str().expect("utf8 path"),
            "--force",
        ])
        .assert()
        .success()
        .stdout(predicate::str::contains("✅ Skill installation complete."))
        .stdout(predicate::str::contains("Added: ycloud-components"));
}

#[test]
fn config_set_and_get_metadata_url() {
    let temp_dir = tempdir().expect("temp dir");
    let config_home = temp_dir.path().join("config");
    let metadata_url = "https://example.com/metadata.json";

    command()
        .env_remove("YCC_USE_LOCAL_META_DATA")
        .env_remove("YCC_META_DATA_URL")
        .env("XDG_CONFIG_HOME", &config_home)
        .args(["config", "set", "metadataUrl", metadata_url])
        .assert()
        .success();

    let config_file = config_home.join("ycc").join("config.json");
    let config_content = fs::read_to_string(&config_file).expect("config file");
    let config: Value = serde_json::from_str(&config_content).expect("valid config json");
    assert_eq!(config["metadataUrl"], metadata_url);

    let output = command()
        .env_remove("YCC_USE_LOCAL_META_DATA")
        .env_remove("YCC_META_DATA_URL")
        .env("XDG_CONFIG_HOME", &config_home)
        .args(["config", "get", "metadataUrl"])
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let value: Value = serde_json::from_slice(&output).expect("valid json");

    assert_eq!(value["metadataUrl"], metadata_url);
}

#[test]
fn config_get_metadata_url_prefers_env_override() {
    let temp_dir = tempdir().expect("temp dir");
    let config_home = temp_dir.path().join("config");

    command()
        .env_remove("YCC_USE_LOCAL_META_DATA")
        .env_remove("YCC_META_DATA_URL")
        .env("XDG_CONFIG_HOME", &config_home)
        .args([
            "config",
            "set",
            "metadataUrl",
            "https://config.example.com/metadata.json",
        ])
        .assert()
        .success();

    let output = command()
        .env_remove("YCC_USE_LOCAL_META_DATA")
        .env("XDG_CONFIG_HOME", &config_home)
        .env("YCC_META_DATA_URL", "https://env.example.com/metadata.json")
        .args(["config", "get", "metadataUrl"])
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();
    let value: Value = serde_json::from_slice(&output).expect("valid json");

    assert_eq!(
        value["metadataUrl"],
        "https://env.example.com/metadata.json"
    );
}
