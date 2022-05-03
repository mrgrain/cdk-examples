import { TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Grant } from "aws-cdk-lib/aws-iam";
import { Function, FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SlackBotStackProps extends StackProps {
  ssmSecureConfigPath: string;
}

export class SlackBotStack extends Stack {
  constructor(scope: Construct, id: string, props: SlackBotStackProps) {
    super(scope, id, props);

    const { ssmSecureConfigPath } = props;

    const ssmSecureConfigPathArn = Stack.of(this).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: ssmSecureConfigPath.substring(1),
    });

    const messageReceiver = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_14_X,
      handler: "receiver.handler",
      memorySize: 512,
      code: new TypeScriptCode("./functions/receiver.ts", {
        buildOptions: {
          sourcemap: true,
        },
      }),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
        CONFIG_PATH: ssmSecureConfigPath,
      },
    });
    Grant.addToPrincipal({
      grantee: messageReceiver,
      actions: ["ssm:GetParametersByPath"],
      resourceArns: [ssmSecureConfigPathArn],
    });

    const botEndpoint = messageReceiver.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "EndpointUrl", {
      value: botEndpoint.url,
    });
  }
}
