#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SlackBotStack } from "../infrastructure/slack-bot-stack";

const app = new cdk.App();
new SlackBotStack(app, "SlackBotStack", {
  ssmSecureConfigPath: "/examples/slack-bot",
});
