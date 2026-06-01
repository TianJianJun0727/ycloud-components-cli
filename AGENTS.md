# AGENTS.md

本仓库默认使用简体中文沟通。

## 项目概览

`@ycloud/components-cli` 是 `ycc` 命令行工具，用于查询 `@ycloud/components` 组件元数据、示例、文档，并提供内置 skill 安装和 MCP stdio 服务。

当前实现以 Rust 为核心：

- CLI 入口：`src/main.rs`
- npm 命令入口：`dist/ycc`
- 测试：`tests/`

## 常用命令

```bash
cargo fmt --check
cargo test
cargo clippy -- -D warnings
pnpm build
```

发布前构建当前平台产物：

```bash
pnpm build
```

## 开发约定

- 保持 Rust 标准目录结构，不恢复旧 TypeScript CLI 结构。
- 对外命令名保持 `ycc`。
- metadata 默认源为 `https://ui.ycloud.com/metadata.json`。
- metadata 源优先级：`YCC_META_DATA_URL` > `~/.config/ycc/config.json` > 默认源。
- metadata 缓存默认写入 `~/.config/ycc/cache/metadata.json`。
- 修改命令行为时同步更新测试和 README。
