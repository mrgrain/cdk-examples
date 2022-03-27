import { CfnImageRecipe } from "aws-cdk-lib/aws-imagebuilder";
import { Construct } from "constructs";
import { Component } from "./component";

export interface IImageRecipe {
  imageRecipeArn: string;
}

export interface ImageRecipeProps {
  components?: Component[];
  name: string;
  parentImage: string;
  version: string;
  volumeSize?: number;
}

export class ImageRecipe extends Construct implements IImageRecipe {
  public readonly imageRecipeArn: string;

  public constructor(scope: Construct, id: string, props: ImageRecipeProps) {
    super(scope, id);

    const {
      components = [],
      name,
      parentImage,
      version,
      volumeSize = 30,
    } = props;

    const recipeProps = {
      name,
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
