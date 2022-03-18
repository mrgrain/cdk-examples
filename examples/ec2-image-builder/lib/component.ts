import { DockerImage } from "aws-cdk-lib";
import { CfnComponent } from "aws-cdk-lib/aws-imagebuilder";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";

export interface ComponentProps {
  name: string;
  platform: string;
  version: string;
  definitionPath: string;
  validateDefinition?: boolean;
}

export class Component extends Construct {
  public readonly uri: string;

  public constructor(scope: Construct, id: string, props: ComponentProps) {
    super(scope, id);

    const {
      name,
      platform,
      version,
      definitionPath: path,
      validateDefinition = false,
    } = props;

    const componentDefinition = new Asset(this, "Definition", {
      path,
    });

    this.uri = componentDefinition.s3ObjectUrl;

    new CfnComponent(this, "Resource", {
      name,
      platform,
      version,
      uri: componentDefinition.s3ObjectUrl,
    });

    if (validateDefinition) {
      this.node.addValidation({
        validate: () => this.validateComponentDefinition(path),
      });
    }
  }

  protected validateComponentDefinition(path: string) {
    try {
      new DockerImage("oppara/awstoe:latest").run({
        command: ["awstoe", "validate", "--documents", path],
        volumes: [
          {
            containerPath: "/data",
            hostPath: process.cwd(),
          },
        ],
        workingDirectory: "/data",
      });
      return [];
    } catch (e: any) {
      return [
        `${path}: AWSTOE validation failed, please check output for further details`,
      ];
    }
  }
}
