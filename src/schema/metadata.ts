import { z } from "zod";

const ComponentPropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  default: z.string().optional(),
  description: z.string(),
  since: z.string().optional(),
  deprecated: z.union([z.boolean(), z.string()]).optional(),
});

const ComponentDemoSchema = z.object({
  name: z.string(),
  nameZh: z.string(),
  description: z.string().optional(),
  code: z.string(),
});

const ComponentSchema = z.object({
  name: z.string(),
  nameZh: z.string(),
  description: z.string(),
  inheritMuiProps: z.string().optional(),
  props: z.array(ComponentPropSchema),
  demos: z.array(ComponentDemoSchema),
  whenToUse: z.string().optional(),
  bestPractices: z.string().optional(),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .optional(),
  doc: z.string().optional(),
  since: z.string().optional(),
});

const ChangeSchema = z.object({
  component: z.string(),
  type: z.string(),
  description: z.string(),
});

const ChangeLogSchema = z.object({
  version: z.string(),
  date: z.string(),
  changes: z.array(ChangeSchema),
});

export const MetaDataSchema = z.object({
  version: z.string(),
  muiVersion: z.string(),
  components: z.array(ComponentSchema),
  changeLogs: z.array(ChangeLogSchema),
});
