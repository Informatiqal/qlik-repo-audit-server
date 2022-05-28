import express from "express";
import * as bodyParser from "body-parser";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import { Config } from "./config/Config";
const config = new Config();

import { logger } from "./logger/logger";

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers, port) {
    this.app = express();
    this.port = port;

    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.printRoutes();

    // const a = this.app._router.stack
    //   .filter((r) => r.route)
    //   .map((r) => Object.keys(r.route.methods)[0].toUpperCase().padEnd(7) + r.route.path)
    //   .join('\n');

    // console.log(JSON.stringify(a, null, 2));

    // const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    // signalTraps.forEach((type) => {
    //   process.once(type, async () => {
    //     logger.info(`process.once ${type}`);

    //     this.app.close(() => {
    //       logger.debug('HTTP server closed');
    //     });
    //   });
    // });
  }

  private initializeMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  private initializeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  private printRoutes() {
    const endpoints = listEndpoints(this.app as any);
    const result = [];

    for (let endpoint of endpoints) {
      for (let method of endpoint.methods) {
        result.push({
          path: endpoint.path,
          method,
        });
      }
    }

    const transformed = result.reduce((acc, { path, ...x }) => {
      acc[path] = x;
      return acc;
    }, {});

    if (config.logLevel == "debug") console.table(transformed);
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Server ready at ${this.port}`);
    });
  }
}

export default App;
