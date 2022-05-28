import fs from "fs";
import yaml from "js-yaml";
import winston from "winston";
// const { combine, timestamp, json } = winston.format;
const MESSAGE = Symbol.for("message");

const logLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5,
  },
};

const mainConfig = yaml.load(
  fs.readFileSync("./config/main.yaml", "utf8")
) as any;

const jsonFormatter = (logEntry) => {
  const base = {
    timestamp: new Date(),
    level: logEntry.level,
    message: logEntry.message,
  };
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

const LoggerWrapper = () => {
  return winston.createLogger({
    format: winston.format(jsonFormatter)(),
    // combine(
    //   timestamp({
    //     format: "YYYY-MM-DD HH:mm:ss",
    //   }),
    //   logLikeFormat,
    //   json(),
    // ),
    transports: [new winston.transports.Console()],
    exitOnError: false,
    levels: logLevels.levels,
    level: mainConfig.logLevel || "info",
  }) as winston.Logger &
    Record<keyof typeof logLevels["levels"], winston.LeveledLogMethod>;
};

export const logger = LoggerWrapper();
