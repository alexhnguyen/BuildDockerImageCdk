import * as cdk from "@aws-cdk/core";
import ImageRepositories from "./constructs/image-repositories";
import PackagePipelines from "./constructs/package-pipelines";

export class BuildDockerImageCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ImageRepositories(this, "ImageRepositories");
    new PackagePipelines(this, "PackagePipeline");
  }
}
