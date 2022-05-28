import { HttpError } from "src/lib/CustomErrors";
import { logger } from "src/logger/logger";
import { EnrichedObjectData } from "src/types/interfaces";
import { Config } from "../config/Config";
import { NotificationRepository } from "../repository/Notification.repository";
import { ObjectNamesService } from "../service/ObjectNames.service";

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private objectNamesService: ObjectNamesService;
  private config: Config;
  constructor() {
    this.config = new Config();
    this.notificationRepository = new NotificationRepository();
    this.objectNamesService = new ObjectNamesService();
  }

  async processNotification(
    server: string,
    notificationBody: { [k: string]: any }[]
  ) {
    if (!this.config.servers[server])
      throw new HttpError(404, `Server "${server}" not found`);

    const validNotifications = notificationBody.filter((b) => b.objectID);

    if (validNotifications.length == 0) return;

    const changeTypes = {
      1: "Add",
      2: "Update",
      3: "Delete",
    };

    const objectsData = await Promise.all<EnrichedObjectData>(
      validNotifications.map((objectBody) => {
        return this.config.servers[server].repoApi.repoClient
          .Get(`${objectBody.objectType}/${objectBody.objectID}`)
          .then((qlikData: any) => ({
            host: this.config.servers[server].host,
            name: this.config.servers[server].name,
            objectId: objectBody.objectID,
            objectType: objectBody.objectType,
            objectName: qlikData.data.name || qlikData.data.description || null,
            changeType: changeTypes[objectBody.changeType] || "UNDEFINED",
            data: JSON.stringify(qlikData.data),
            modifiedBy: qlikData.data.modifiedByUserName,
            updatedAt: qlikData.data.modifiedDate,
          }))
          .catch((e) => {
            logger.error(e.message);
            return {} as unknown as EnrichedObjectData;
          });
      })
    );

    await Promise.all([
      this.notificationRepository.insertNotificationObjects(objectsData),
      this.objectNamesService.processNotificationObjects(objectsData),
    ]);

    return { error: false };
  }

  async getAllServers() {
    return await this.notificationRepository.getAllServers();
  }

  async getAllTypesForServer(server: string) {
    return await this.notificationRepository.getAllTypesForServer(server);
  }

  async getAllTypesForServerFull(server: string) {
    return await this.notificationRepository.getAllObjectsForServerFull(server);
  }

  async getAllObjectsForServer(server: string) {
    return await this.notificationRepository.getAllObjectsForServer(server);
  }

  async getSingleObject(objectId: string) {
    return await this.notificationRepository.getSingleObject(objectId);
  }
}
