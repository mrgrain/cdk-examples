#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CanaryStack } from "../lib/canary-stack";

const app = new cdk.App();
new CanaryStack(app, "CanaryStack", {
  version: "3",
});
