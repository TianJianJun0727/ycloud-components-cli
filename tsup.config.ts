import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => ({
  entry: ["src/cli.ts"],
  format: ["cjs"],
  clean: true,
  shims: true,
  define: {
    "process.env.NODE_ENV": watch
      ? JSON.stringify("development")
      : JSON.stringify("production"),
  },
}));
