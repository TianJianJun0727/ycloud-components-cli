import semver from "semver";
import chalk from "chalk";
import boxen from "boxen";
import { CLI_NAME, NPM_REGISTRY_URL } from "../constants";

export const checkNodeVersion = (wanted: string, id: string) => {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(
      chalk.red(
        "You are using Node " +
          process.version +
          ", but this version of " +
          id +
          " requires Node " +
          wanted +
          ".\nPlease upgrade your Node version.",
      ),
    );
    process.exit(1);
  }
};

export const printUpdateNotice = ({
  currentVersion,
  latestVersion,
  hasUpdate,
}: {
  currentVersion: string;
  latestVersion?: string;
  hasUpdate: boolean;
}) => {
  if (hasUpdate) {
    console.log(
      boxen(
        `🔔 New version available! ${chalk.redBright(currentVersion)} ➡️  ${chalk.greenBright(
          latestVersion,
        )}.\n Run "${chalk.cyanBright(`npm install -g ${CLI_NAME}@latest`)} --registry=${NPM_REGISTRY_URL}" to update.`,
        {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderColor: "yellow",
          align: "center",
          titleAlignment: "center",
        },
      ),
    );
  }
};
