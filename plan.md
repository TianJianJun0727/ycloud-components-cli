## 需求目标
你是一个资深的前端工程师，擅长前端工程化，熟悉nodejs生态.
现在我们公司有一个私有的组件库叫做@ycloud/components, 开发同学使用claude code让ai帮忙还原页面或者编写业务功能代码，ai拿到figma的设计稿后，看到一个类似select的组件，他并不知道要用@ycloud/components中的countrySelect组件，或者是说他知道要用countrySelect组件，但是自己乱写props，或者把原先的上个版本已经废弃的api还用起来了，因此基于这个痛点，现在需要你帮我开发一个cli命令行工具，这个工具主要用于对接claude code等ai工具，使得ai工具可以写出正确的组件代码，注意：需要支持离线查询组件库文档，并且区分组件库版本

需要支持的命令有这些
```bash

# 查看所有组件
ycc list --format json 

# 查看有哪些可用属性
ycc info Button --format json

# 获取可运行的示例作为起点
ycc demo Button basic --format json

# 查看语义化 classNames/styles 用于自定义样式
ycc semantic Button --format json

```

## 项目技术栈
pnpm + nodejs + typescript + tsup + commander

## 开发命令
```bash
pnpm dev
```
## 构建命令
```bash
pnpm build
```