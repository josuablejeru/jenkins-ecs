#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { JenkinsDaggerExampleStack } from '../lib/jenkins-dagger-example-stack';

const app = new cdk.App();
new JenkinsDaggerExampleStack(app, 'JenkinsDaggerExampleStack', {
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});