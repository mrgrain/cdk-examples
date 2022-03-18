#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BuilderStack } from "../lib/builder-stack";

const app = new cdk.App();
new BuilderStack(app, "BuilderStack", {});
