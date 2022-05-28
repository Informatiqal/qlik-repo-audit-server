import { Sequelize, Repository } from "sequelize-typescript";
import { connect } from "src/config/db.config";
import { HttpError } from "src/lib/CustomErrors";
import { logger } from "src/logger/logger";
import { DB, EnrichedObjectData } from "src/types/interfaces";
import { Notification } from "../model/Notification.model";

export class NotificationRepository {
  private db: DB;
  private notificationRepository: Repository<Notification>;

  constructor() {
    this.db = connect();
    this.db.Sequelize.sync({ force: false });
    this.notificationRepository = (
      this.db.Sequelize as Sequelize
    ).getRepository(Notification);
  }
  async insertNotificationObjects(qlikObjects: EnrichedObjectData[]) {
    await this.notificationRepository
      .bulkCreate(qlikObjects as any)
      .catch((e) => {
        logger.error("insertNotificationObjects  query error", {
          errorMessage: e.message,
        });
        throw new HttpError(500, "Internal server error");
      });

    return true;
  }

  async getAllServers() {
    return await this.notificationRepository
      .findAll({
        attributes: ["name"],
        group: ["name"],
      })
      .then((servers) => servers.map((server) => server.name));
  }

  async getAllTypesForServer(server: string) {
    return await this.notificationRepository
      .findAll({
        attributes: ["objectType"],
        group: ["objectType"],
        where: {
          name: server,
        },
      })
      .then((objects) => objects.map((object) => object.objectType));
  }

  async getAllObjectsForServer(server: string) {
    return await this.notificationRepository
      .findAll({
        attributes: [
          [
            Sequelize.fn("DISTINCT", this.db.Sequelize.col("objectId")),
            "alias_name",
          ],
          "objectId",
          "objectType",
        ],
        where: {
          name: server,
        },
        order: [["objectType", "ASC"]],
      })
      .then((objects) =>
        objects.map((object) => ({
          objectId: object.objectId,
          objectType: object.objectType,
        }))
      )
      .catch((e) => {
        logger.error("getAllObjectsForServer query error", {
          errorMessage: e.message,
        });
        throw new HttpError(500, "Internal server error");
      });
  }

  async getAllObjectsForServerFull(server: string) {
    return await this.notificationRepository.findAll({
      attributes: { exclude: ["id", "updatedAt"] },
      where: {
        name: server,
      },
    });
  }

  async getSingleObject(objectId: string) {
    return await this.notificationRepository.findAll({
      attributes: { exclude: ["id", "updatedAt"] },
      where: {
        objectId: objectId,
      },
      order: [["updatedAt", "DESC"]],
    });
  }
}
