import { Construct } from "constructs";
import { CfnImagePipeline } from "aws-cdk-lib/aws-imagebuilder";
import { IInfrastructureConfiguration } from "./infrastructure-configuration";
import { IDistributionConfiguration } from "./distribution-configuration";
import { IImageRecipe } from "./image-recipe";
import { Schedule } from "aws-cdk-lib/aws-events";

export enum PipelineExecutionStartCondition {
  EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE = "EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE",
  EXPRESSION_MATCH_ONLY = "EXPRESSION_MATCH_ONLY",
}

export interface IImagePipeline {
  readonly imagePipelineArn: string;
  readonly name: string;
}

export interface ImagePipelineProps {
  distributionConfiguration?: IDistributionConfiguration;
  enhancedImageMetadataEnabled?: boolean;
  imageRecipe: IImageRecipe;
  infrastructureConfiguration: IInfrastructureConfiguration;
  name: string;
  pipelineExecutionStartCondition?: PipelineExecutionStartCondition;
  schedule?: Schedule;
}

export class ImagePipeline extends Construct implements IImagePipeline {
  public readonly imagePipelineArn: string;
  public readonly name: string;

  public constructor(scope: Construct, id: string, props: ImagePipelineProps) {
    super(scope, id);

    const {
      distributionConfiguration,
      enhancedImageMetadataEnabled = true,
      imageRecipe,
      infrastructureConfiguration,
      name,
      pipelineExecutionStartCondition = PipelineExecutionStartCondition.EXPRESSION_MATCH_ONLY,
      schedule,
    } = props;

    const pipeline = new CfnImagePipeline(this, "Resource", {
      name,
      infrastructureConfigurationArn:
        infrastructureConfiguration.infrastructureConfigurationArn,
      distributionConfigurationArn:
        distributionConfiguration?.distributionConfigurationArn,
      enhancedImageMetadataEnabled,
      imageRecipeArn: imageRecipe.imageRecipeArn,
    });

    if (schedule) {
      pipeline.schedule = {
        scheduleExpression: schedule.expressionString,
        pipelineExecutionStartCondition,
      };
    }

    this.imagePipelineArn = pipeline.attrArn;
    this.name = name;
  }
}
