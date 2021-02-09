import * as cdk from "@aws-cdk/core";
import * as ecr from "@aws-cdk/aws-ecr";

import { ECR_NAME } from "../constants";

/**
 * Creates the ECR repositories that the docker images will
 * be built into.
 */
export default class ImageRepositories extends cdk.Construct {
  constructor(scope: cdk.Stack, id: string) {
    super(scope, id);
    [ECR_NAME.SIMPLE_DOCKER_REPO].map(
      (repositoryName) =>
        new ecr.Repository(
          this,
          `${toPascalCase(repositoryName)}EcrRepository`,
          {
            repositoryName: repositoryName,
            lifecycleRules: [{ maxImageCount: 5 }],
            removalPolicy: cdk.RemovalPolicy.DESTROY,
          }
        )
    );
  }
}

// remove "-" and uppercase first letter
const clearAndUpper = (text: string) => text.replace(/-/, "").toUpperCase();
// convert kebab to pascal case
// e.g. my-word -> MyWord
const toPascalCase = (text: string) =>
  text.replace(/(^\w|-\w)/g, clearAndUpper);
