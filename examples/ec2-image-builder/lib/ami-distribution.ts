import {
  captureStackTrace,
  IResolvable,
  IResolveContext,
  Stack,
} from "aws-cdk-lib";

export interface AmiDistributionProps {
  nameTemplate?: string;
}

export class AmiDistribution implements IResolvable {
  public readonly creationStack: string[];
  protected name: string;

  public constructor(amiName: string, props: AmiDistributionProps = {}) {
    const { nameTemplate = `${amiName} - {{imagebuilder:buildDate}}` } = props;
    this.name = nameTemplate;
    this.creationStack = captureStackTrace();
  }

  resolve(context: IResolveContext) {
    return {
      amiDistributionConfiguration: {
        Name: this.name,
      },
      region: Stack.of(context.scope).region,
    };
  }
}
