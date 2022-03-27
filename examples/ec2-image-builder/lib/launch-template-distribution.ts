import { IResolveContext, Stack } from "aws-cdk-lib";
import { ILaunchTemplate } from "aws-cdk-lib/aws-ec2";
import { CfnDistributionConfiguration } from "aws-cdk-lib/aws-imagebuilder";
import { AmiDistribution, AmiDistributionProps } from "./ami-distribution";

export interface LaunchTemplateDistributionProps extends AmiDistributionProps {
  amiName: string;
  launchTemplates: ILaunchTemplate[];
  setDefaultVersion?: boolean;
}

export class LaunchTemplateDistribution extends AmiDistribution {
  readonly launchTemplateConfigurations?: CfnDistributionConfiguration.LaunchTemplateConfigurationProperty[];
  private props: LaunchTemplateDistributionProps;

  public constructor(props: LaunchTemplateDistributionProps) {
    super(props.amiName, props);
    this.props = props;
  }

  resolve(context: IResolveContext) {
    const { launchTemplates, setDefaultVersion = true } = this.props;

    return {
      ...super.resolve(context),
      launchTemplateConfigurations: launchTemplates.map((launchTemplate) => ({
        accountId: Stack.of(context.scope).account,
        launchTemplateId: launchTemplate.launchTemplateId,
        setDefaultVersion,
      })),
    };
  }
}
