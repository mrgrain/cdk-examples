import { Construct } from "constructs";
import { Grant } from "aws-cdk-lib/aws-iam";
import { Function, FunctionProps } from "aws-cdk-lib/aws-lambda";
import { Stack } from "aws-cdk-lib";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export interface SlackWorkerProps {
  ssmSecureConfigPath: string;
  messageQueue: IQueue;
  functionProps: FunctionProps;
}

export class SlackWorker extends Construct {
  constructor(scope: Construct, id: string, props: SlackWorkerProps) {
    super(scope, id);

    const { ssmSecureConfigPath, messageQueue, functionProps } = props;

    const ssmSecureConfigPathArn = Stack.of(this).formatArn({
      service: "ssm",
      resource: "parameter",
      resourceName: ssmSecureConfigPath.substring(1),
    });

    const lambda = new Function(this, "Resource", {
      ...functionProps,
      environment: {
        ...functionProps.environment,
        CONFIG_PATH: ssmSecureConfigPath,
      },
    });

    Grant.addToPrincipal({
      grantee: lambda,
      actions: ["ssm:GetParametersByPath"],
      resourceArns: [ssmSecureConfigPathArn],
    });

    lambda.addEventSource(
      new SqsEventSource(messageQueue, {
        batchSize: 1,
      })
    );
  }
}
