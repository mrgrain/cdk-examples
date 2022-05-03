import { App, AwsLambdaReceiver, ReceiverEvent } from "@slack/bolt";
import {
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { Handler } from "aws-lambda";
import { Config, getConfig } from "../src/config";
import * as logger from "../src/logger";

let CONFIG: Config;

export const handler: Handler<AwsEvent, AwsResponse> = async (
  event,
  context,
  callback
) => {
  if (!CONFIG) {
    CONFIG = await getConfig(process.env.CONFIG_PATH!);
  }

  const { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } = CONFIG;

  const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: SLACK_SIGNING_SECRET,
  });

  // Initializes your app with your bot token and the AWS Lambda ready receiver
  const app = new App({
    token: SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
  });

  app.processEvent = async ({
    body,
    retryNum,
    retryReason,
    customProperties,
    ack,
  }: ReceiverEvent) => {
    const incomingEvent = {
      body,
      retryNum,
      retryReason,
      customProperties,
    };

    logger.debug("IncomingEvent", {
      incomingEvent,
    });

    await ack();
  };

  const handler = await awsLambdaReceiver.start();
  const response = await handler(event, context, callback);

  logger.debug("CreatedResponse", {
    response,
  });

  return response;
};
