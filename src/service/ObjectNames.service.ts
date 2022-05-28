import { EnrichedObjectData } from "src/types/interfaces";
import { Config } from "../config/Config";
import { ObjectNamesRepository } from "../repository/ObjectNames.repository";

export class ObjectNamesService {
  private objectNamesRepository: ObjectNamesRepository;
  constructor() {
    this.objectNamesRepository = new ObjectNamesRepository();
  }

  async processNotificationObjects(objects: EnrichedObjectData[]) {
    const allObjectNames = await this.objectNamesRepository.getAllObjects();

    await this.objectNamesRepository.upsertObjectName(
      objects.map((o) => ({
        objectId: o.objectId,
        objectName: o.objectName,
        objectType: o.objectType,
        server: o.name,
        updatedAt: o.updatedAt,
      }))
    );

    return allObjectNames;
  }

  async allObjectNames() {
    return await this.objectNamesRepository.getAllObjects();
  }
}
