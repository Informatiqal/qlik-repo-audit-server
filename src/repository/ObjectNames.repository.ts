import { Sequelize, Repository } from "sequelize-typescript";
import { connect } from "src/config/db.config";
import { DB, IObjectNames } from "src/types/interfaces";
import { ObjectNames } from "../model/ObjectNames.model";

export class ObjectNamesRepository {
  private db: DB;
  private objectNamesRepository: Repository<ObjectNames>;

  constructor() {
    this.db = connect();
    this.db.Sequelize.sync({ force: false }).catch((e) => {
      let a = 1;
    });

    this.objectNamesRepository = (this.db.Sequelize as Sequelize).getRepository(
      ObjectNames
    );
  }

  async getObjectName(objectId: string) {
    return await this.objectNamesRepository.findOne({
      where: { objectId },
    });
  }

  async upsertObjectName(arg: IObjectNames[]) {
    return await this.objectNamesRepository.bulkCreate(arg as any, {
      updateOnDuplicate: ["objectName", "updatedAt"],
    });
  }

  async getAllObjects() {
    return await this.objectNamesRepository.findAll({
      attributes: ["server", "objectType", "objectId", "objectName"],
      order: [
        ["updatedAt", "DESC"],
        ["objectType", "ASC"],
        ["objectId", "ASC"],
      ],
    });
  }
}
