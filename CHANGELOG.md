# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 2.0.0-beta.0 (2026-06-01)


### Features

* 将 CLI 核心从 Node/TypeScript 迁移为 Rust 实现
* 使用 Rust 标准目录结构，保留 `ycc` 对外命令名
* npm 包入口调整为当前平台 Rust 二进制 `dist/ycc`
* 新增 `ycc config get/set metadataUrl`，支持配置 metadata 源
* 将 metadata 配置与缓存目录迁移到 `~/.config/ycc`
* 初始化 Codex 项目说明文件 `AGENTS.md`


### Notes

* 这是 v2 测试版本，发布到私有源的 beta tag

## 1.2.0 (2026-04-13)


### Features

* 错误处理流程开发 ([67c0121](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/67c012167c8845172caeb09d27645ce71f7c1492))
* 切换命令行工具 ([d2c2d19](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d2c2d19ebae6f26808981220efdf165481b4fa17))
* 新增skill命令，支持安装skill ([1581d27](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/1581d27cf672da3e6fcae868a5c2a0cf78e0b93e))
* 优化更新检测的逻辑 ([78111d8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/78111d8e7abfe755270500f8b3639d252cdec3c7))
* 优化skill ([b3de3fc](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/b3de3fc2fdebb777c0a6bb7800f9cc6135dec727))
* 增加env环境变量加载逻辑 ([4b7a29f](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4b7a29f0b4145757cc4473fc363b60a617d59cfd))
* 增加metadata schema校验逻辑 ([7837f08](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/7837f087d1d0f2a8e9e7439bd73dbbdb3343851f))
* 支持从项目获取文档元数据 ([d3511c1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d3511c1b2e43150ade614edca2a1df74025b6612))
* 支持远端抓取metadata ([72637c8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/72637c896051241251eeb813ee9304024a800a79))
* 支持cli版本更新检测 ([297acd9](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/297acd95d68708bc53cf7d9d553e4085ee4eb169))
* 支持mcp ([552155b](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/552155b8003d34666b0fb8cfab050c417ab15151))
* cli版本检测 ([4d6c4f1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4d6c4f130943da2c9dc070c836cc645ab781ad4d))
* docs命令开发 ([e7210fe](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/e7210fe71ac994c6dfa326eb54bf6240015ef178))
* init 工程搭建 ([00fe0db](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/00fe0db347c0dae19fe25148a524b96ccacf83ef))
* skill编写 ([53db09a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/53db09aac38b8ab8494134fc7c350bc37530cd96))


### Bug Fixes

* 修复版本更新检测接口请求地址错误 ([2e05ad5](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/2e05ad52e4d15de721d44f5c66e42aa2527ffcc7))
* 修复版本号 ([24a971c](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/24a971cfa5c3360ab563571769dd4611e3fc07e2))
* 修复打包目录 ([d033d1a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d033d1ae3c5af03e9027b9f781cf6cd5bab4bb34))

## 1.1.0 (2026-04-13)


### Features

* 错误处理流程开发 ([67c0121](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/67c012167c8845172caeb09d27645ce71f7c1492))
* 切换命令行工具 ([d2c2d19](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d2c2d19ebae6f26808981220efdf165481b4fa17))
* 新增skill命令，支持安装skill ([bd8d6ac](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/bd8d6ac18c298d2e8eaf533195f8dfbede669533))
* 优化更新检测的逻辑 ([78111d8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/78111d8e7abfe755270500f8b3639d252cdec3c7))
* 优化skill ([b3de3fc](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/b3de3fc2fdebb777c0a6bb7800f9cc6135dec727))
* 增加env环境变量加载逻辑 ([4b7a29f](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4b7a29f0b4145757cc4473fc363b60a617d59cfd))
* 增加metadata schema校验逻辑 ([7837f08](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/7837f087d1d0f2a8e9e7439bd73dbbdb3343851f))
* 支持从项目获取文档元数据 ([d3511c1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d3511c1b2e43150ade614edca2a1df74025b6612))
* 支持远端抓取metadata ([72637c8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/72637c896051241251eeb813ee9304024a800a79))
* 支持cli版本更新检测 ([297acd9](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/297acd95d68708bc53cf7d9d553e4085ee4eb169))
* 支持mcp ([552155b](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/552155b8003d34666b0fb8cfab050c417ab15151))
* cli版本检测 ([4d6c4f1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4d6c4f130943da2c9dc070c836cc645ab781ad4d))
* docs命令开发 ([e7210fe](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/e7210fe71ac994c6dfa326eb54bf6240015ef178))
* init 工程搭建 ([00fe0db](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/00fe0db347c0dae19fe25148a524b96ccacf83ef))
* skill编写 ([53db09a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/53db09aac38b8ab8494134fc7c350bc37530cd96))


### Bug Fixes

* 修复版本更新检测接口请求地址错误 ([2e05ad5](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/2e05ad52e4d15de721d44f5c66e42aa2527ffcc7))

## 1.1.0 (2026-04-08)


### Features

* 错误处理流程开发 ([67c0121](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/67c012167c8845172caeb09d27645ce71f7c1492))
* 切换命令行工具 ([d2c2d19](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d2c2d19ebae6f26808981220efdf165481b4fa17))
* 优化更新检测的逻辑 ([78111d8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/78111d8e7abfe755270500f8b3639d252cdec3c7))
* 增加env环境变量加载逻辑 ([4b7a29f](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4b7a29f0b4145757cc4473fc363b60a617d59cfd))
* 增加metadata schema校验逻辑 ([7837f08](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/7837f087d1d0f2a8e9e7439bd73dbbdb3343851f))
* 支持从项目获取文档元数据 ([d3511c1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d3511c1b2e43150ade614edca2a1df74025b6612))
* 支持远端抓取metadata ([72637c8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/72637c896051241251eeb813ee9304024a800a79))
* 支持cli版本更新检测 ([297acd9](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/297acd95d68708bc53cf7d9d553e4085ee4eb169))
* 支持mcp ([552155b](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/552155b8003d34666b0fb8cfab050c417ab15151))
* cli版本检测 ([4d6c4f1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4d6c4f130943da2c9dc070c836cc645ab781ad4d))
* docs命令开发 ([e7210fe](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/e7210fe71ac994c6dfa326eb54bf6240015ef178))
* init 工程搭建 ([00fe0db](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/00fe0db347c0dae19fe25148a524b96ccacf83ef))
* skill编写 ([53db09a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/53db09aac38b8ab8494134fc7c350bc37530cd96))


### Bug Fixes

* 修复版本更新检测接口请求地址错误 ([ca1270a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/ca1270a85079f109620dfb5df4bda13415d94a43))

## 1.1.0 (2026-04-08)


### Features

* 错误处理流程开发 ([67c0121](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/67c012167c8845172caeb09d27645ce71f7c1492))
* 切换命令行工具 ([d2c2d19](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d2c2d19ebae6f26808981220efdf165481b4fa17))
* 优化更新检测的逻辑 ([78111d8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/78111d8e7abfe755270500f8b3639d252cdec3c7))
* 增加env环境变量加载逻辑 ([4b7a29f](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4b7a29f0b4145757cc4473fc363b60a617d59cfd))
* 增加metadata schema校验逻辑 ([7837f08](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/7837f087d1d0f2a8e9e7439bd73dbbdb3343851f))
* 支持从项目获取文档元数据 ([d3511c1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/d3511c1b2e43150ade614edca2a1df74025b6612))
* 支持远端抓取metadata ([72637c8](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/72637c896051241251eeb813ee9304024a800a79))
* 支持cli版本更新检测 ([297acd9](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/297acd95d68708bc53cf7d9d553e4085ee4eb169))
* 支持mcp ([552155b](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/552155b8003d34666b0fb8cfab050c417ab15151))
* cli版本检测 ([4d6c4f1](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/4d6c4f130943da2c9dc070c836cc645ab781ad4d))
* docs命令开发 ([e7210fe](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/e7210fe71ac994c6dfa326eb54bf6240015ef178))
* init 工程搭建 ([00fe0db](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/00fe0db347c0dae19fe25148a524b96ccacf83ef))
* skill编写 ([53db09a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/53db09aac38b8ab8494134fc7c350bc37530cd96))


### Bug Fixes

* 修复版本更新检测接口请求地址错误 ([ca1270a](https://git.taovip.com/sunkaicheng/ycloud-components-cli/commit/ca1270a85079f109620dfb5df4bda13415d94a43))

### [1.0.0]
`@ycloud/components-cli` 首个版本发布。面向 AI 编程助手（Claude Code、Cursor、Copilot 等）的 组件 命令行工具，支持组件知识查询与项目分析，提供结构化输出。

### 📚 知识查询

- **`ycc list`** — 列出所有 @ycloud/components 组件，展示双语名称、描述和分类
- **`ycc info <Component>`** — 查询组件 API，包括 Props、类型、默认值；`--detail` 获取完整文档、方法和 FAQ
- **`ycc doc <Component>`** — 输出完整的组件 API 文档（Markdown 格式）
- **`ycc demo <Component> [demoName]`** — 获取组件示例源码
- **`ycc meta`** — 获取基础元数据
- **`ycc mcp`** — 以MCP服务提供组件知识查询功能，支持 IDE 集成, 目前beta版，不建议在生产环境直接使用
