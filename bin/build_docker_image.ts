#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BuildDockerImageStack } from '../lib/build_docker_image-stack';

const app = new cdk.App();
new BuildDockerImageStack(app, 'BuildDockerImageStack');
