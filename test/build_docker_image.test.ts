import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as BuildDockerImage from '../lib/build_docker_image-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new BuildDockerImage.BuildDockerImageStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
