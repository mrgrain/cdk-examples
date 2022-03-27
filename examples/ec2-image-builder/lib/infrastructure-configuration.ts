import { Construct } from "constructs";
import { CfnInfrastructureConfiguration } from "aws-cdk-lib/aws-imagebuilder";
import {
  CfnInstanceProfile,
  IRole,
  ManagedPolicy,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  ISecurityGroup,
  ISubnet,
} from "aws-cdk-lib/aws-ec2";

export interface IInfrastructureConfiguration {
  readonly infrastructureConfigurationArn: string;
  readonly instanceProfileArn: string;
  readonly name: string;
  readonly role: IRole;
}

export interface InfrastructureConfigurationProps {
  instanceTypes?: InstanceType[];
  keyPair?: string;
  name: string;
  role?: IRole;
  securityGroups?: ISecurityGroup[];
  subnet?: ISubnet;
  terminateInstanceOnFailure?: boolean;
}

export class InfrastructureConfiguration
  extends Construct
  implements IInfrastructureConfiguration
{
  public readonly infrastructureConfigurationArn: string;
  public readonly instanceProfileArn: string;
  public readonly name: string;
  public readonly role: IRole;

  public constructor(
    scope: Construct,
    id: string,
    props: InfrastructureConfigurationProps
  ) {
    super(scope, id);

    const {
      instanceTypes = [
        InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MEDIUM),
      ],
      keyPair,
      name,
      role = new Role(this, "Role", {
        assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonSSMManagedInstanceCore"
          ),
          ManagedPolicy.fromAwsManagedPolicyName(
            "EC2InstanceProfileForImageBuilder"
          ),
        ],
      }),
      securityGroups = [],
      subnet,
      terminateInstanceOnFailure = true,
    } = props;

    const instanceProfile = new CfnInstanceProfile(this, "InstanceProfile", {
      roles: [role.roleName],
    });

    const config = new CfnInfrastructureConfiguration(this, "Resource", {
      name,
      instanceProfileName: instanceProfile.ref,
      instanceTypes: instanceTypes?.map((type) => type.toString()),
      subnetId: subnet?.subnetId,
      securityGroupIds: securityGroups?.map(
        (securityGroup) => securityGroup.securityGroupId
      ),
      terminateInstanceOnFailure,
      keyPair,
    });

    this.infrastructureConfigurationArn = config.attrArn;
    this.instanceProfileArn = instanceProfile.attrArn;
    this.name = name;
    this.role = role;
  }
}
