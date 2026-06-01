export const platformBinaries = {
  "darwin-arm64": {
    rustTarget: "aarch64-apple-darwin",
    binaryName: "ycc",
  },
  "darwin-x64": {
    rustTarget: "x86_64-apple-darwin",
    binaryName: "ycc",
  },
  "linux-x64": {
    rustTarget: "x86_64-unknown-linux-gnu",
    binaryName: "ycc",
  },
  "windows-x64": {
    rustTarget: "x86_64-pc-windows-msvc",
    binaryName: "ycc.exe",
  },
};

export function currentPlatformKey() {
  const key = `${process.platform}-${process.arch}`;
  if (key === "win32-x64") {
    return "windows-x64";
  }
  if (key === "darwin-arm64" || key === "darwin-x64" || key === "linux-x64") {
    return key;
  }
  throw new Error(`Unsupported build platform: ${process.platform} ${process.arch}`);
}
