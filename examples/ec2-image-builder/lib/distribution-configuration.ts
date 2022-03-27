import { Construct } from "constructs";
import { CfnDistributionConfiguration } from "aws-cdk-lib/aws-imagebuilder";
import { IResolvable } from "aws-cdk-lib";

export type IDistribution =
  | CfnDistributionConfiguration.DistributionProperty
  | IResolvable;

export interface IDistributionConfiguration {
  readonly distributionConfigurationArn: string;
  readonly name: string;
}

export interface DistributionConfigurationProps {
  description?: string;
  distributions?: IDistribution[];
  name: string;
}

export class DistributionConfiguration
  extends Construct
  implements IDistributionConfiguration
{
  public readonly distributionConfigurationArn: string;
  public readonly distributions: IDistribution[] = [];
  public readonly name: string;

  public constructor(
    scope: Construct,
    id: string,
    props: DistributionConfigurationProps
  ) {
    super(scope, id);

    const { description, distributions, name } = props;

    const config = new CfnDistributionConfiguration(this, "Resource", {
      name,
      description,
      distributions: this.distributions,
    });

    distributions?.forEach((distribution) =>
      this.addDistribution(distribution)
    );

    this.distributionConfigurationArn = config.attrArn;
    this.name = props.name;
  }

  public addDistribution(distribution: IDistribution) {
    this.distributions.push(distribution);
  }
}
