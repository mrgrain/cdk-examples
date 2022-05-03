import * as crypto from "node:crypto";
import { CfnImageRecipe } from "aws-cdk-lib/aws-imagebuilder";
import { Construct } from "constructs";
import { Component } from "./component";

export interface IImageRecipe {
  imageRecipeArn: string;
}

export interface ImageRecipeProps {
  components?: Component[];
  name?: string;
  parentImage: string;
  version?: string;
  volumeSize?: number;
}

export class ImageRecipe extends Construct implements IImageRecipe {
  public readonly imageRecipeArn: string;

  public constructor(scope: Construct, id: string, props: ImageRecipeProps) {
    super(scope, id);

    const {
      components = [],
      parentImage,
      version = "1.0.0",
      volumeSize = 30,
    } = props;

    const recipeProps = {
      name: this.autoName(props),
      components: components.map((component) => ({
        componentArn: component.componentArn.toString(),
      })),
      parentImage,
      version,
      blockDeviceMappings: [
        {
          deviceName: "/dev/sda1",
          ebs: {
            deleteOnTermination: true,
            volumeSize,
            volumeType: "gp2",
          },
        },
      ],
      workingDirectory: "/tmp",
    };

    const cfnImageRecipe = new CfnImageRecipe(this, "Resource", recipeProps);

    this.imageRecipeArn = cfnImageRecipe.ref;
  }

  protected autoName(props: ImageRecipeProps): string {
    const {
      name = this.node.id,
      components,
      parentImage,
      version,
      volumeSize,
    } = props;

    if (version) {
      return name;
    }

    const sha256 = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          name,
          parentImage,
          version,
          volumeSize,
        })
      )
      .update(JSON.stringify(components?.map((component) => component.name)));
    const hash = sha256.digest("hex").slice(0, 8);

    return [name, hash].join("-");
  }

  public static fromImageRecipeArn(
    scope: Construct,
    id: string,
    imageRecipeArn: string
  ): IImageRecipe {
    return new (class extends Construct {
      public constructor(
        scope: Construct,
        id: string,
        public readonly imageRecipeArn: string
      ) {
        super(scope, id);
      }
    })(scope, id, imageRecipeArn);
  }
}
