#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class LambdaSourcemapStack extends Stack {
  constructor(scope?: Construct, id?: string, props?: StackProps) {
    super(scope, id, props);

    const lambda = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: new TypeScriptCode("./src/index.ts", {
        buildOptions: {
          sourcemap: true,
        },
      }),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

    new CfnOutput(this, "LambdaArn", {
      value: lambda.functionArn,
    });
  }
}

const app = new cdk.App();
new LambdaSourcemapStack(app, "LambdaSourcemapStack");
