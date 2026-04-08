# Changelog

### [1.0.0]
`@ycloud/components-cli` 首个版本发布。面向 AI 编程助手（Claude Code、Cursor、Copilot 等）的 组件 命令行工具，支持组件知识查询与项目分析，提供结构化输出。

### 📚 知识查询

- **`ycc list`** — 列出所有 @ycloud/components 组件，展示双语名称、描述和分类
- **`ycc info <Component>`** — 查询组件 API，包括 Props、类型、默认值；`--detail` 获取完整文档、方法和 FAQ
- **`ycc doc <Component>`** — 输出完整的组件 API 文档（Markdown 格式）
- **`ycc demo <Component> [demoName]`** — 获取组件示例源码
- **`ycc meta`** — 获取基础元数据
- **`ycc mcp`** — 以MCP服务提供组件知识查询功能，支持 IDE 集成, 目前beta版，不建议在生产环境直接使用