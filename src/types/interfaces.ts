import { QlikRepoApi } from "qlik-repo-api";
import { Sequelize } from "sequelize-typescript";

export interface ConfigServer {
  host: string;
  name: string;
  certificates: string;
  repoApi?: QlikRepoApi.client;
  alive?: boolean;
  checkState?: number;
}

export type LogLevel = "debug" | "info" | "error";

export interface ConfigMain {
  port: number;
  logLevel: LogLevel;
  callbackURL: string;
  db: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export interface EnrichedObjectData {
  host: string;
  name: string;
  objectId: string;
  objectType: string;
  objectName: string;
  changeType: string;
  data: string;
  modifiedBy: string;
  updatedAt: string;
}

export interface DB {
  Sequelize: Sequelize;
}

export interface IObjectNames {
  objectId: string;
  objectName: string;
  objectType: string;
  server: string;
}
