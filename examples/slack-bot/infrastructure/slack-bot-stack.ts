import { TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Queue } from "aws-cdk-lib/aws-sqs";

import { Construct } from "constructs";
import { SlackReceiver } from "./receiver";
import { SlackWorker } from "./worker";

interface SlackBotStackProps extends StackProps {
  ssmSecureConfigPath: string;
}

export class SlackBotStack extends Stack {
  constructor(scope: Construct, id: string, props: SlackBotStackProps) {
    super(scope, id, props);

    const { ssmSecureConfigPath } = props;

    const messageQueue = new Queue(this, "MessageQueue", {
      retentionPeriod: Duration.minutes(5),
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: new Queue(this, "MessageDLQ"),
      },
    });

    new SlackWorker(this, "Worker", {
      ssmSecureConfigPath,
      messageQueue,
      functionProps: {
        runtime: Runtime.NODEJS_14_X,
        handler: "worker.handler",
        memorySize: 512,
        code: new TypeScriptCode("./functions/worker.ts", {
          buildOptions: {
            sourcemap: true,
          },
        }),
        environment: {
          NODE_OPTIONS: "--enable-source-maps",
        },
      },
    });

    const botEndpoint = new SlackReceiver(this, "Receiver", {
      ssmSecureConfigPath,
      messageQueue,
    });

    new CfnOutput(this, "EndpointUrl", {
      value: botEndpoint.url,
    });
  }
}
