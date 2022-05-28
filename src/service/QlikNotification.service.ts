import { IClassNode } from "qlik-repo-api/dist/Node";
import { IServiceStatus } from "qlik-repo-api/dist/ServiceStatus";
import { logger } from "../logger/logger";
import { ConfigServer } from "../types/interfaces";

export class QlikNotificationService {
  servers: ConfigServer[];
  private callBackUrl: string;
  constructor(servers: ConfigServer[], callbackURLBase: string) {
    this.servers = servers;
    this.callBackUrl = `${callbackURLBase}/notification/receive/server`;
  }

  async init() {
    this.startRepoStatusPooling();
  }

  private async createNotification(server) {
    const qlikObjectTypesAdd = [
      "AnalyticConnection",
      "App",
      "ContentLibrary",
      "DataConnection",
      "Extension",
      "ReloadTask",
      "Stream",
      "User",
      "UserSyncTask",
      "SystemRule",
      "Tag",
      "CustomPropertyDefinition",
    ];

    const qlikObjectTypesUpdate = [
      "App",
      "AnalyticConnection",
      "ContentLibrary",
      "DataConnection",
      "Extension",
      "ReloadTask",
      "Stream",
      "User",
      "UserSyncTask",
      "SystemRule",
      "Tag",
      "CustomPropertyDefinition",
      "EngineService",
      "OdagService",
      "PrintingService",
      "ProxyService",
      "RepositoryService",
      "SchedulerService",
      "ServerNodeConfiguration",
      "VirtualProxyConfig",
    ];

    const qlikObjectTypesDelete = [
      "AnalyticConnection",
      "App",
      "ContentLibrary",
      "DataConnection",
      "Extension",
      "ReloadTask",
      "Stream",
      "User",
      "UserSyncTask",
      "SystemRule",
      "Tag",
      "CustomPropertyDefinition",
    ];

    const promises = [];

    qlikObjectTypesAdd.forEach((addObject) => {
      const url = `notification?name=${addObject}&changeType=add`;
      promises.push(() =>
        server.repoApi.repoClient
          .Post(url, `"${this.callBackUrl}/${server.name}"`, "application/json")
          //   .Post(url, `"${conf.main.callbackURL}/notification/receive"`, "application/json")
          .then((res) => {
            logger.debug(`ADD notification created`, {
              object: addObject,
              notificationId: res.data.value,
              host: server.host,
            });
          })
          .catch((e) =>
            logger.error(e.message, { url, body: this.callBackUrl })
          )
      );
    });

    qlikObjectTypesUpdate.forEach((updateObject) => {
      const url = `notification?name=${updateObject}&changeType=update`;
      promises.push(() =>
        server.repoApi.repoClient
          .Post(url, `"${this.callBackUrl}/${server.name}"`, "application/json")
          .then((res) => {
            logger.debug(`UPDATE notification created`, {
              object: updateObject,
              notificationId: res.data.value,
              host: server.host,
            });
          })
          .catch((e) =>
            logger.error(e.message, { url, body: this.callBackUrl })
          )
      );
    });

    qlikObjectTypesDelete.forEach((deleteObject) => {
      const url = `notification?name=${deleteObject}&changeType=delete`;
      promises.push(() =>
        server.repoApi.repoClient
          .Post(url, `"${this.callBackUrl}/${server.name}"`, "application/json")
          .then((res) => {
            logger.debug(`DELETE notification created`, {
              object: deleteObject,
              notificationId: res.data.value,
              host: server.host,
            });
          })
          .catch((e) =>
            logger.error(e.message, { url, body: this.callBackUrl })
          )
      );
    });

    // const notificationResponses = await Promise.all(promises.map((r) => r()));
    // logger.info(
    //   `${notificationResponses.length} notifications created for ${server.host}`
    // );
  }

  private async checkRepoStatus() {
    this.servers = await Promise.all(
      this.servers.map(async (server) => {
        return this.getNodeStatus(server).then((s) => {
          if (server.alive == true)
            logger.info(`Connection established to ${server.host}}`);

          return server;
        });
        // const centralNode = await server.repoApi.nodes
        //   .getFilter({ filter: "isCentral eq true" })
        //   .catch((e) => {
        //     logger.error(`Unable to connect to "${server.host}"`, {
        //       errorMessage: e.message,
        //     });
        //     return [] as unknown as IClassNode[];
        //   });

        // if (centralNode.length == 0) {
        //   logger.error(`No central node found for "${server.host}"`);
        //   server.alive = false;
        //   return server;
        // }

        // const centralNodeRepositoryStatus = await server.repoApi.serviceStatus
        //   .getFilter({
        //     filter: `serviceType eq 0 and serviceState eq 2 and serverNodeConfiguration.id eq ${centralNode[0].details.id}`,
        //   })
        //   .catch((e) => {
        //     logger.error(`Unable to connect to "${server.host}"`, {
        //       errorMessage: e.message,
        //     });
        //     return [] as unknown as IServiceStatus[];
        //   });

        // if (centralNodeRepositoryStatus.length == 0) {
        //   logger.error(`No running repository service for "${server.host}"`);
        //   server.alive = false;
        //   return server;
        // }

        // logger.info(`Connection established to "${server.host}}"`);

        // if (server.alive == false) await this.createNotification(server);

        // server.alive = true;
        // return server;
      })
    );
  }

  private async startRepoStatusPooling() {
    const _this: this = this;
    for (let server of this.servers) {
      setInterval(function () {
        _this
          .getNodeStatus(server)
          .then((a) => logger.debug(`Successful ping of ${server.host}`));
      }, 2000);
    }
  }

  async getNodeStatus(server: ConfigServer) {
    const centralNode = await server.repoApi.nodes
      .getFilter({ filter: "isCentral eq true" })
      .catch((e) => {
        logger.error(`Unable to connect to "${server.host}"`, {
          errorMessage: e.message,
        });
        return [] as unknown as IClassNode[];
      });

    if (centralNode.length == 0) {
      if (server.alive == undefined)
        logger.error(`No central node found for "${server.host}"`);
      if (server.alive == true)
        logger.error(`Connection lost with "${server.host}"`);
      server.alive = false;
      return server;
    }

    const centralNodeRepositoryStatus = await server.repoApi.serviceStatus
      .getFilter({
        filter: `serviceType eq 0 and serviceState eq 2 and serverNodeConfiguration.id eq ${centralNode[0].details.id}`,
      })
      .catch((e) => {
        logger.error(`Unable to connect to "${server.host}"`);
        if (server.alive == true)
          logger.error(`Connection lost with "${server.host}"`);
        return [] as unknown as IServiceStatus[];
      });

    if (centralNodeRepositoryStatus.length == 0) {
      if (server.alive == undefined)
        logger.error(`No running repository service for "${server.host}"`);
      if (server.alive == true)
        logger.error(`Connection lost with "${server.host}"`);
      server.alive = false;
      return server;
    }

    if (server.alive == false)
      logger.info(`Connection restored with ${server.host}`);

    if (server.alive == undefined)
      logger.info(`Connection established with ${server.host}}`);

    if (server.alive == false || server.alive == undefined) {
      await this.createNotification(server);
    }

    server.alive = true;
    return server;
  }
}
