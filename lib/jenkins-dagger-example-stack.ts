import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  buildCluster,
  buildVPC,
  buildJenkinsFargateService
} from './ecs-cluster'
import { buildFilesystem } from './filesystem'

export class JenkinsDaggerExampleStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = buildVPC(this)
    const cluster = buildCluster(this, vpc, "JenkinsCluster")
    const jenkinsFileSystem = buildFilesystem(this, vpc)

    const service = buildJenkinsFargateService(this, {
      cluster,
      fileSystem: jenkinsFileSystem.fileSystem,
      accessPoint: jenkinsFileSystem.accessPoint
    })
  }
}
