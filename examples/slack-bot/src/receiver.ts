import { App, AwsLambdaReceiver, ReceiverEvent } from "@slack/bolt";
import {
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { Handler } from "aws-lambda";

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
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

export const handler: Handler<AwsEvent, AwsResponse> = async (
  event,
  context,
  callback
) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
