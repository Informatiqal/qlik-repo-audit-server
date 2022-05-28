import * as express from "express";

export class GlobalController {
  public path = "";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/health`, this.health);
  }

  health = (request: express.Request, response: express.Response) => {
    response.send("UP");
  };
}
