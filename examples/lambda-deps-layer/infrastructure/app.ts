#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TypeScriptCode } from "@mrgrain/cdk-esbuild";
import { AssetHashType, DockerImage, Stack, StackProps } from "aws-cdk-lib";
import { Code, Function, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { buildSync } from "esbuild";
import { mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

export class LambdaDependencyLayerStack extends Stack {
  constructor(scope?: Construct, id?: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "Bucket", {
      publicReadAccess: true,
    });

    const { metafile } = buildSync({
      entryPoints: ["./src/index.ts"],
      bundle: true,
      platform: "node",
      metafile: true,
      write: false,
    });

    const modules = Object.keys(
      metafile?.outputs?.["index.js"]?.inputs || {}
    ).reduce((modules, file) => {
      const module = file.match(/node_modules\/([^\/]*)\/.*/)?.[1];
      return module ? modules.add(module) : modules;
    }, new Set<string>());

    const deps = new LayerVersion(this, "Dependencies", {
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      code: Code.fromAsset("node_modules", {
        assetHash: Array.from(modules).sort().join(),
        assetHashType: AssetHashType.CUSTOM,
        bundling: {
          image: DockerImage.fromRegistry("scratch"),
          local: {
            tryBundle(outputDir, _options) {
              const dest = join(outputDir, "nodejs", "node_modules");
              mkdirSync(dest, {
                recursive: true,
              });
              const command = `cp -R ${Array.from(modules)
                .map((mod) => `node_modules/${mod}`)
                .join(" ")} ${dest}`;

              execSync(command);

              return true;
            },
          },
        },
      }),
    });

    const lambda = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_16_X,
      handler: "index.handler",
      layers: [deps],
      code: new TypeScriptCode("./src/index.ts", {
        buildOptions: {
          sourcemap: true,
          external: Array.from(modules),
        },
      }),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
        BUCKET_NAME: bucket.bucketName,
      },
    });
    bucket.grantReadWrite(lambda);
  }
}

const app = new cdk.App();
new LambdaDependencyLayerStack(app, "LambdaDependencyLayerStack");
