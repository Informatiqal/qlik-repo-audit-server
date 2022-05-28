import * as express from "express";
import { logger } from "../logger/logger";
import { ObjectNamesService } from "../service/ObjectNames.service";

export class ObjectNAmesController {
  public path = "/objectNames";
  public router = express.Router();
  private objectNamesService: ObjectNamesService;

  constructor() {
    this.objectNamesService = new ObjectNamesService();

    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/all`, this.allObjectNames);
  }

  allObjectNames = async (req: express.Request, res: express.Response) => {
    const a = await this.objectNamesService.allObjectNames();
    res.send(a);
  };
}

export default ObjectNAmesController;
