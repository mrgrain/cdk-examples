import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Component } from "./component";

export interface BuilderStackProps extends StackProps {}

export class BuilderStack extends Stack {
  constructor(scope: Construct, id: string, props: BuilderStackProps) {
    super(scope, id, props);

    new Component(this, "hello-world", {
      name: "hello-world",
      platform: "Linux",
      version: "1.0.0",
      definitionPath: "components/hello-world.yml",
      validateDefinition: true,
    });
  }
}
