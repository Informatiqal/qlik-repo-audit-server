import * as express from "express";
import { logger } from "../logger/logger";
import { NotificationService } from "../service/Notification.service";

export class NotificationController {
  public path = "/notification";
  public router = express.Router();
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`${this.path}/receive/server/:server`, this.receive);
    this.router.get(`${this.path}/allServers`, this.allServers);
    this.router.get(`${this.path}/allTypes/:server`, this.allTypesForServer);
    this.router.get(
      `${this.path}/allObjects/:server`,
      this.allObjectsForServer
    );
    this.router.get(
      `${this.path}/allObjects/:server/full`,
      this.allObjectsForServerFull
    );
    this.router.get(`${this.path}/object/:objectId`, this.singleObject);
  }

  receive = async (req: express.Request, res: express.Response) => {
    if (!req.params["server"]) {
      logger.error(`"server" query parameter was not found`);
      return res.status(400).send(`"server" query parameter was not found`);
    }

    try {
      await this.notificationService.processNotification(
        req.params["server"],
        req.body
      );
    } catch (e: any) {
      res.status(e.status).send(e.message);
    }

    logger.info(
      `Notification for ${req.body.length} object(s) from "${req.params["server"]}"`
    );

    logger.debug(
      `Notification for ${req.body.length} object(s) from "${req.params["server"]}"`,
      { objectIds: req.body.map((o) => o.objectID) }
    );

    res.send();
  };

  allServers = async (req: express.Request, res: express.Response) => {
    const serversList = await this.notificationService.getAllServers();

    res.send(serversList);
  };

  allTypesForServer = async (req: express.Request, res: express.Response) => {
    const allTypesForServer =
      await this.notificationService.getAllTypesForServer(req.params["server"]);

    res.send(allTypesForServer);
  };

  allObjectsForServer = async (req: express.Request, res: express.Response) => {
    const allObjectsForServer = await this.notificationService
      .getAllObjectsForServer(req.params["server"])
      .catch((e) => res.status(e.status).send(e.message));

    res.send(allObjectsForServer);
  };

  allObjectsForServerFull = async (
    req: express.Request,
    res: express.Response
  ) => {
    const allObjectsForServer =
      await this.notificationService.getAllObjectsForServer(
        req.params["server"]
      );

    res.send(allObjectsForServer);
  };

  singleObject = async (req: express.Request, res: express.Response) => {
    const singleObject = await this.notificationService.getSingleObject(
      req.params["objectId"]
    );

    res.send(singleObject);
  };
}

export default NotificationController;
