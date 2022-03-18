import { CfnComponent } from "aws-cdk-lib/aws-imagebuilder";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";

export interface ComponentProps {
  name: string;
  platform: string;
  version: string;
  definitionPath: string;
}

export class Component extends Construct {
  public constructor(scope: Construct, id: string, props: ComponentProps) {
    super(scope, id);

    const { name, platform, version, definitionPath: path } = props;

    const componentDefinition = new Asset(this, "Definition", {
      path,
    });

    const cfnComponent = new CfnComponent(this, "Resource", {
      name,
      platform,
      version,
      uri: componentDefinition.s3ObjectUrl,
    });
  }
}
