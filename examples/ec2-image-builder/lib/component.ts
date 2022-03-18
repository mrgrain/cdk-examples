import { CfnComponent } from "aws-cdk-lib/aws-imagebuilder";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { execSync } from "child_process";
import { Construct } from "constructs";

export interface ComponentProps {
  name: string;
  platform: string;
  version: string;
  definitionPath: string;
  validateDefinition?: boolean;
  awstoePath?: string;
}

export class Component extends Construct {
  public readonly uri: string;

  public constructor(scope: Construct, id: string, props: ComponentProps) {
    super(scope, id);

    const {
      name,
      platform,
      version,
      definitionPath: path,
      validateDefinition = false,
      awstoePath,
    } = props;

    const componentDefinition = new Asset(this, "Definition", {
      path,
    });

    this.uri = componentDefinition.s3ObjectUrl;

    new CfnComponent(this, "Resource", {
      name,
      platform,
      version,
      uri: componentDefinition.s3ObjectUrl,
    });

    if (validateDefinition) {
      this.node.addValidation({
        validate: () => this.validateComponentDefinition(path, awstoePath),
      });
    }
  }

  protected validateComponentDefinition(path: string, awstoe = "awstoe") {
    const parseOutput = (
      stdout: Buffer
    ): { validationStatus: boolean; message: string } => {
      const result = JSON.parse(stdout.toString());
      return result;
    };

    try {
      execSync(`${awstoe} validate --documents ${path}`, {
        stdio: "pipe",
      });

      return [];
    } catch (e: any) {
      if ("output" in e) {
        const [, stdout, stderr] = e.output;

        if (stdout.toString()) {
          const { message } = parseOutput(stdout);
          return [`${path}: ${message}`];
        }

        if (stderr.includes("not found")) {
          return [
            "awstoe executable not found in $PATH",
            "Please install AWSTOE, see https://docs.aws.amazon.com/imagebuilder/latest/userguide/toe-get-started.html",
          ];
        }

        return [stderr];
      }

      if ("message" in e) {
        return [e.message];
      }

      return ["Something went wrong", e];
    }
  }
}
