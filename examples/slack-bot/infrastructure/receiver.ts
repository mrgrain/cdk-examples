import { Construct } from "constructs";
import { Grant } from "aws-cdk-lib/aws-iam";
import { Function, FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { Stack } from "aws-cdk-lib";
import { IQueue } from "aws-cdk-lib/aws-sqs";

export interface SlackReceiverProps {
  ssmSecureConfigPath: string;
  messageQueue: IQueue;
}

export class SlackReceiver extends Construct {
  public readonly url: string;

  constructor(scope: Construct, id: string, props: SlackReceiverProps) {
    super(scope, id);

    const { ssmSecureConfigPath, messageQueue } = props;

    const ssmSecureConfigPathArn = Stack.of(this).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: ssmSecureConfigPath.substring(1),
    });

    const messageReceiver = new Function(this, "Resource", {
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
        MESSAGE_QUEUE_URL: messageQueue.queueUrl,
      },
    });

    Grant.addToPrincipal({
      grantee: messageReceiver,
      actions: ["ssm:GetParametersByPath"],
      resourceArns: [ssmSecureConfigPathArn],
    });
    messageQueue.grantSendMessages(messageReceiver);

    const botEndpoint = messageReceiver.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    this.url = botEndpoint.url;
  }
}
