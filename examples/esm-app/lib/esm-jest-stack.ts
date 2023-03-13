import { Duration, Stack, StackProps, aws_sqs as sqs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class EsmJestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new sqs.Queue(this, 'EsmJestQueue', {
      visibilityTimeout: Duration.seconds(300)
    });
  }
}
