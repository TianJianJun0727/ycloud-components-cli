# AGENTS.md

本仓库默认使用简体中文沟通。

## 项目概览

`@ycloud/components-cli` 是 `ycc` 命令行工具，用于查询 `@ycloud/components` 组件元数据、示例、文档，并提供内置 skill 安装和 MCP stdio 服务。

当前实现以 Rust 为核心：

- CLI 入口：`src/main.rs`
- 发布脚本：`scripts/release-gitlab.sh`
- 测试：`tests/`

## 常用命令

```bash
cargo fmt --check
cargo test
cargo clippy -- -D warnings
cargo build --release
```

发布前构建当前平台产物：

```bash
DRY_RUN=1 scripts/release-gitlab.sh
```

## 开发约定

- 保持 Rust 标准目录结构，不恢复旧 TypeScript CLI 结构。
- 不使用 npm 发布或安装；发布产物上传到 GitLab Generic Package Registry，并通过 GitLab Release 下载。
- 安装脚本需要同时安装二进制，并以软链方式初始化内置 skills。
- 对外命令名保持 `ycc`。
- metadata 默认源为 `https://ui.ycloud.com/metadata.json`。
- metadata 源优先级：`YCC_META_DATA_URL` > `~/.config/ycc/config.json` 中的 `source` > 默认源。
- metadata 缓存默认写入 `~/.config/ycc/cache/metadata.json`。
- 修改命令行为时同步更新测试和 README。
