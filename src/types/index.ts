export type ComponentProp = {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
  since?: string;
  deprecated?: boolean | string;
};

export type ComponentDemo = {
  name: string;
  nameZh: string;
  description?: string;
  code: string;
};

export type Component = {
  name: string;
  description: string;
  inheritMuiProps: string | null;
  props: ComponentProp[];
  demos: ComponentDemo[];
  whenToUse?: string;
  bestPractices?: string;
  faq?: { question: string; answer: string }[];
  doc?: string;
  since?: string;
};

export type Change = {
  component: string;
  type: string;
  description: string;
};

export type ChangeLog = {
  version: string;
  date: string;
  changes: Change[];
};

export type MetaData = {
  version: string;
  muiVersion: string;
  components: Component[];
  changeLogs: ChangeLog[];
};
