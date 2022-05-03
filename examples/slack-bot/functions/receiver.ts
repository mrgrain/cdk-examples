import { App, AwsLambdaReceiver, ReceiverEvent } from "@slack/bolt";
import {
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { Handler } from "aws-lambda";
import { Config, getConfig } from "../src/config";

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
  }: ReceiverEvent) => {
    console.log({
      body,
      retryNum,
      retryReason,
      customProperties,
    });
  };

  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
