import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import * as yaml from "js-yaml";
import { DockerImage, Names, Stack } from "aws-cdk-lib";
import { CfnComponent, CfnImageRecipe } from "aws-cdk-lib/aws-imagebuilder";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";

export interface IComponent {
  componentArn: string;
  parameters?: CfnImageRecipe.ComponentParameterProperty[];
}

export interface ComponentProps {
  definitionPath: string;
  name?: string;
  platform: string;
  validateDefinition?: boolean;
  version?: string;
}

export class Component extends Construct implements IComponent {
  public readonly componentArn: string;
  public name: string;
  public readonly uri: string;

  public constructor(scope: Construct, id: string, props: ComponentProps) {
    super(scope, id);

    const {
      definitionPath: path,
      name = this.autoName(props.definitionPath),
      platform,
      validateDefinition = false,
      version = "1.0.0",
    } = props;

    const componentDefinition = new Asset(this, "Definition", {
      path,
    });

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
    this.name = component.name;
    this.uri = componentDefinition.s3ObjectUrl;
  }

  protected autoName(definitionPath: string): string {
    const definitionFile = readFileSync(definitionPath, "utf8");
    const definition = yaml.load(definitionFile) as {
      name?: string;
    };

    const name = definition?.name ?? this.node.id;

    const hashLength = 10;
    const sha256 = crypto
      .createHash("sha256")
      .update(Names.uniqueId(this))
      .update(definitionPath)
      .update(definitionFile);
    const hash = sha256.digest("hex").slice(0, hashLength);

    return [Stack.of(this).stackName, name, hash].join("-");
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
