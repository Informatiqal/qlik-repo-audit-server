import { Sequelize } from "sequelize-typescript";
import { DB } from "src/types/interfaces";
import { Notification } from "../model/Notification.model";
import { ObjectNames } from "../model/ObjectNames.model";
import { Config } from "./Config";
const config = new Config();

export const connect = () => {
  const hostName = config.main.db.host;
  const userName = config.main.db.user;
  const password = config.main.db.pass;
  const database = "NotificationAPI";
  const dialect = "postgres";

  const sequelize = new Sequelize(database, userName, password, {
    host: hostName,
    port: config.main.db.port,
    dialect,
    repositoryMode: true,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 20000,
      idle: 5000,
    },
  });

  sequelize.addModels([Notification, ObjectNames]);

  const db: DB = {
    Sequelize: sequelize,
  };

  return db;
};
