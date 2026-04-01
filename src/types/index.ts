export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export interface ComponentDemo {
  name: string;
  code: string;
  description: string;
}

export interface ComponentSemantic {
  className: string;
  description: string;
}

export interface Component {
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  props: ComponentProp[];
  demos: ComponentDemo[];
  semantics: ComponentSemantic[];
}

export interface MetaData {
  version: string;
  components: Component[];
}
