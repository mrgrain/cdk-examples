import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";

import { Construct } from "constructs";
import { SlackReceiver } from "./receiver";

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

    const botEndpoint = new SlackReceiver(this, "Receiver", {
      ssmSecureConfigPath,
      messageQueue,
    });

    new CfnOutput(this, "EndpointUrl", {
      value: botEndpoint.url,
    });
  }
}
