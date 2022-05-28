import App from "./App";
import { Config } from "./config/Config";
import { GlobalController } from "./controller/Global.controller";
import { NotificationController } from "./controller/Notification.controller";
import { QlikNotificationService } from "./service/QlikNotification.service";
import { ObjectNAmesController } from "./controller/ObjectNames.controller";

async function start() {
  const config = new Config();
  const qlikNotificationService = new QlikNotificationService(
    config.serversArray,
    config.main.callbackURL
  );

  await qlikNotificationService.init();

  const app = new App(
    [
      new GlobalController(),
      new NotificationController(),
      new ObjectNAmesController(),
    ],
    config.main.port || 5000
  );
  app.listen();
}

start();
