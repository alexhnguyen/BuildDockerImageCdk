import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipelineactions from "@aws-cdk/aws-codepipeline-actions";
import * as kms from "@aws-cdk/aws-kms";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";

export default class PackagePipelines extends cdk.Construct {
  constructor(scope: cdk.Stack, id: string) {
    super(scope, id);
    new CodeBuildPipeline(scope, {
      pipelineName: "SimpleDockerBuild",
      // https://github.com/alexhnguyen/SimpleDockerRepo
      owner: "alexhnguyen",
      repo: "SimpleDockerRepo",
      branch: "main",
    });
  }
}

export interface CodeBuildPipelineProps {
  pipelineName: string;
  owner: string;
  repo: string;
  branch: string;
}

/**
 * Create a CodeBuild Pipeline that gets triggered
 * whenever a Github project is updated.
 */
class CodeBuildPipeline {
  constructor(scope: cdk.Stack, props: CodeBuildPipelineProps) {
    const codeBuildProject = new codebuild.PipelineProject(
      scope,
      `PackageBuild${props.pipelineName}`,
      {
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
          // need this as we build a Docker image. for more details, see
          // actual comment of "privileged"
          // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-codebuild.BuildEnvironment.html#privileged
          privileged: true,
        },
      }
    );

    if (!codeBuildProject.role) {
      throw new Error(
        `CodePipeline does not have a role in stack ${scope.stackId}`
      );
    }

    const artifactBucket = new s3.Bucket(
      scope,
      `ArtifactBucket${props.pipelineName}`,
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        encryptionKey: new kms.Key(scope, `KmsKey${props.pipelineName}`, {
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
      }
    );
    artifactBucket.grantReadWrite(codeBuildProject.role);

    const sourceOutput = new codepipeline.Artifact(
      `SourceOutput${props.pipelineName}`
    );
    codeBuildProject.role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["codeartifact:*", "sts:*", "ecr:*"],
        resources: ["*"],
      })
    );

    // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-codepipeline-actions-readme.html#github
    const oauth = cdk.SecretValue.secretsManager("my-github-token-3");

    new codepipeline.Pipeline(scope, props.pipelineName, {
      pipelineName: props.pipelineName,
      restartExecutionOnUpdate: true,
      // setting a bucket ourselves makes it easier to develop with
      artifactBucket: artifactBucket,
      stages: [
        {
          stageName: "Github_Source_Action",
          actions: [
            new codepipelineactions.GitHubSourceAction({
              output: sourceOutput,
              owner: props.owner,
              repo: props.repo,
              branch: props.branch,
              oauthToken: oauth,
              actionName: "GitHubSourceAction",
            }),
          ],
        },
        {
          stageName: "Build_Deploy_Image",
          actions: [
            new codepipelineactions.CodeBuildAction({
              project: codeBuildProject,
              input: sourceOutput,
              actionName: "BuildDeployImage",
            }),
          ],
        },
      ],
    });
  }
}
