import { DockerImage } from "aws-cdk-lib";
import { CfnComponent, CfnImageRecipe } from "aws-cdk-lib/aws-imagebuilder";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";

export interface IComponent {
  componentArn: string;
  parameters?: CfnImageRecipe.ComponentParameterProperty[];
}

export interface ComponentProps {
  definitionPath: string;
  name: string;
  platform: string;
  validateDefinition?: boolean;
  version: string;
}

export class Component extends Construct implements IComponent {
  public readonly componentArn: string;
  public readonly uri: string;

  public constructor(scope: Construct, id: string, props: ComponentProps) {
    super(scope, id);

    const {
      definitionPath: path,
      name,
      platform,
      validateDefinition = false,
      version,
    } = props;

    const componentDefinition = new Asset(this, "Definition", {
      path,
    });

    this.uri = componentDefinition.s3ObjectUrl;

    const component = new CfnComponent(this, "Resource", {
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

    this.componentArn = component.attrArn;
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
