import { App, LogLevel } from "@slack/bolt";
import { SQSHandler } from "aws-lambda";
import { Config, getConfig } from "../src/config";
import { SqsEventReceiver } from "../src/SqsEventReceiver";

let CONFIG: Config;

export const handler: SQSHandler = async (
  event,
  context,
  callback
): Promise<void> => {
  if (!CONFIG) {
    CONFIG = await getConfig(process.env.CONFIG_PATH!);
  }

  const { SLACK_BOT_TOKEN } = CONFIG;

  const sqsEventReceiver = new SqsEventReceiver({
    logLevel: LogLevel.DEBUG,
  });

  const app = new App({
    token: SLACK_BOT_TOKEN,
    receiver: sqsEventReceiver,
    developerMode: true,
    logLevel: LogLevel.DEBUG,
    socketMode: false,
  });

  app.event("message", async ({ message, say }) => {
    if (!message.subtype) {
      await say(`_You said:_ ${message.text}`);
    }
  });

  app.command("/echo", async ({ command, respond }) => {
    const echo = command.text.split(" ").slice(-2).join(" ");
    await respond(`${echo} ${echo} ${echo}`);
  });

  const handler = await sqsEventReceiver.start();
  await handler(event, context, callback);
};
