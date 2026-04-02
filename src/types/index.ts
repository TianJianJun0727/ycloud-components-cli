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
  code: string;
  description: string;
};

export type Component = {
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  props: ComponentProp[];
  demos: ComponentDemo[];
  whenToUse: string;
  whenToUseZh: string;
  faq?: { question: string; answer: string }[];
  doc?: string;
  docZh?: string;
};

export type MetaData = {
  version: string;
  components: Component[];
};
