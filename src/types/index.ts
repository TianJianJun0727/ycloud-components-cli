export type ComponentProp = {
  // 属性名称
  name: string;
  // 属性类型
  type: string;
  // 是否必填
  required: boolean;
  // 默认值
  default?: string;
  // 属性描述
  description: string;
  // 引入版本
  since?: string;
  // 是否废弃
  deprecated?: boolean | string;
};

export type ComponentDemo = {
  // 示例名称
  name: string;
  // 示例名称（中文）
  nameZh: string;
  // 示例描述
  description?: string;
  // 示例代码（Markdown）
  code: string;
};

export type Component = {
  // 组件名称
  name: string;
  // 组件描述
  description: string;
  /**
   * 组件props是否继承 MUI 组件props
   * 如果继承，需要指定 MUI 组件的名称，否则为空
   */
  inheritMuiProps: string | null;
  // 组件props
  props: ComponentProp[];
  // 组件示例
  demos: ComponentDemo[];
  // 何时使用
  whenToUse?: string;
  // 最佳实践
  bestPractices?: string;
  // 常见问题
  faq?: { question: string; answer: string }[];
  // 组件完整文档（markdown)
  doc?: string;
  // 引入版本
  since?: string;
};

export type Change = {
  // 变更的组件名称
  component: string;
  // 变更类型， 例如：新增、修改、删除等
  type: string;
  // 变更描述
  description: string;
};

export type ChangeLog = {
  // 版本号
  version: string;
  // 变更日期
  date: string;
  // 变更内容
  changes: Change[];
};

export type MetaData = {
  // 组件库版本
  version: string;
  // 基础 MUI 组件版本
  muiVersion: string;
  // 组件列表
  components: Component[];
  // 变更日志
  changeLogs: ChangeLog[];
};
