import { InlineTypeScriptCode } from "@mrgrain/cdk-esbuild";
import { Stack, StackProps } from "aws-cdk-lib";
import {
  LambdaDeploymentConfig,
  LambdaDeploymentGroup,
} from "aws-cdk-lib/aws-codedeploy";
import { Alias, Function, Runtime, Version } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface CanaryStackProps extends StackProps {
  version: string;
}
export class CanaryStack extends Stack {
  constructor(scope: Construct, id: string, props: CanaryStackProps) {
    super(scope, id, props);

    const { version } = props;

    const lambda = new Function(this, "thingy", {
      runtime: Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: new InlineTypeScriptCode(
        `export function handler() { console.log('Running Version ${version}'); }`
      ),
    });

    const alias = new Alias(this, "prod", {
      aliasName: "prod",
      version: new Version(this, `release-${version}`, {
        lambda,
      }),
    });

    new LambdaDeploymentGroup(this, "shifty", {
      alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
    });
  }
}
