import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Schedule } from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import { AmiDistribution } from "./ami-distribution";
import { Component } from "./component";
import { DistributionConfiguration } from "./distribution-configuration";
import { ImagePipeline } from "./image-pipeline";
import { ImageRecipe } from "./image-recipe";
import { InfrastructureConfiguration } from "./infrastructure-configuration";

export interface BuilderStackProps extends StackProps {}

export class BuilderStack extends Stack {
  constructor(scope: Construct, id: string, props: BuilderStackProps) {
    super(scope, id, props);

    const helloWorld = new Component(this, "HelloWorldComponent", {
      name: "hello-world",
      platform: "Linux",
      version: "1.0.0",
      definitionPath: "components/hello-world.yml",
      validateDefinition: true,
    });

    const imageRecipe = new ImageRecipe(this, "HelloWorldRecipe", {
      components: [helloWorld],
      name: "hello-world-recipe",
      parentImage:
        "arn:aws:imagebuilder:eu-west-1:aws:image/ubuntu-server-20-lts-x86/x.x.x",
      version: "1.0.0",
      volumeSize: 20,
    });

    new ImagePipeline(this, `Pipeline`, {
      distributionConfiguration: new DistributionConfiguration(
        this,
        "Distribution",
        {
          name: "hello-world-distribution",
          distributions: [new AmiDistribution("HelloWorldAmi")],
        }
      ),
      imageRecipe,
      infrastructureConfiguration: new InfrastructureConfiguration(
        this,
        "Instance",
        { name: "hello-world-infra-config" }
      ),
      name: "HelloWorld",
      schedule: Schedule.rate(Duration.days(7)),
    });

    const autoVersionedComponent = new Component(
      this,
      "AutoVersionedComponent",
      {
        platform: "Linux",
        definitionPath: "components/hello-world.yml",
        validateDefinition: true,
      }
    );

    const autoVersionedRecipe = new ImageRecipe(this, "AutoVersionedRecipe", {
      components: [autoVersionedComponent],
      parentImage:
        "arn:aws:imagebuilder:eu-west-1:aws:image/ubuntu-server-20-lts-x86/x.x.x",
      volumeSize: 20,
    });
  }
}
