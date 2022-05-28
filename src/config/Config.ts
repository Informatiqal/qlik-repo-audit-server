import fs from "fs";
import https from "https";
import yaml from "js-yaml";
import { QlikRepoApi } from "qlik-repo-api";
import { logger } from "../logger/logger";
import { ConfigMain, ConfigServer, LogLevel } from "../types/interfaces";

export class Config {
  private static instance: Config;
  main: ConfigMain;
  serversArray: ConfigServer[];
  servers: { [k: string]: ConfigServer };
  logLevel: LogLevel;
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }

    try {
      this.main = yaml.load(
        fs.readFileSync("./config/main.yaml", "utf8")
      ) as any;
      this.serversArray = (
        yaml.load(fs.readFileSync("./config/servers.yaml", "utf8")) as any
      ).servers;

      this.serversArray = this.serversArray.map((server) => ({
        ...server,
        checkState: 0,
      }));
    } catch (e: any) {
      logger.error(e.message);
    }

    this.logLevel = this.main.logLevel || "error";

    this.prepareQlikRepoAPI();

    const serversLocal: { [k: string]: ConfigServer } = {};
    for (let server of this.serversArray) {
      serversLocal[server.name] = server;
    }
    this.servers = serversLocal;

    Config.instance = this;
  }

  private prepareQlikRepoAPI() {
    this.serversArray = this.serversArray.map((server) => {
      const certPath = `${server.certificates}/client.pem`;
      const certKeyPath = `${server.certificates}/client_key.pem`;

      if (!fs.existsSync(certPath)) {
        logger.error(`${certPath} not found`);
      }

      if (!fs.existsSync(certKeyPath)) {
        logger.error(`${certKeyPath} not found`);
      }

      const cert = fs.readFileSync(certPath);
      const certKey = fs.readFileSync(certKeyPath);

      server.repoApi = new QlikRepoApi.client({
        host: server.host,
        port: 4242,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          cert: cert,
          key: certKey,
        }),
        authentication: {
          user_dir: "INTERNAL",
          user_name: "sa_api",
        },
      });

      return server;
    });
  }
}
