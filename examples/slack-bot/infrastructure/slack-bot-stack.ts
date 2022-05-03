import { TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Function, FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SlackBotStackProps extends StackProps {}

export class SlackBotStack extends Stack {
  constructor(scope: Construct, id: string, props: SlackBotStackProps) {
    super(scope, id, props);

    const messageReceiver = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "receiver.handler",
      code: new TypeScriptCode("./src/receiver.ts", {
        buildOptions: {
          sourcemap: true,
        },
      }),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

    const botEndpoint = messageReceiver.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "EndpointUrl", {
      value: botEndpoint.url,
    });
  }
}
