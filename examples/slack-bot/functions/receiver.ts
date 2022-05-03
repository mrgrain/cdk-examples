import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
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

  const app = new App({
    token: SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
  });

  const sqsClient = new SQSClient({});

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

    const sendMessage = new SendMessageCommand({
      QueueUrl: process.env.MESSAGE_QUEUE_URL!,
      MessageBody: JSON.stringify(incomingEvent),
    });
    try {
      await sqsClient.send(sendMessage);
    } catch (error) {
      logger.error("QueuingFailed", { error });
    }

    await ack();
  };

  const handler = await awsLambdaReceiver.start();
  const response = await handler(event, context, callback);

  logger.debug("CreatedResponse", {
    response,
  });

  return response;
};
