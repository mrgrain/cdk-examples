import { App, aws_sqs as sqs } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as EsmJest from '../lib/esm-jest-stack.js';

test('SQS Queue Created', () => {
  const app = new App();
    // WHEN
  const stack = new EsmJest.EsmJestStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
  });
  expect(sqs.QueueEncryption.KMS).toBe('KMS')
});
