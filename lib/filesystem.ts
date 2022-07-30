import {
  aws_efs as efs,
  aws_ec2 as ec2,
  RemovalPolicy
} from 'aws-cdk-lib'
import { Construct, } from 'constructs'


export const buildFilesystem = (scope: Construct, vpc: ec2.IVpc): { fileSystem: efs.FileSystem, accessPoint: efs.IAccessPoint } => {
  const fileSystem = new efs.FileSystem(scope, "JenkinsFileSystem", {
    vpc,
    removalPolicy: RemovalPolicy.DESTROY
  })

  const accessPoint = fileSystem.addAccessPoint("JenkinsAccessPoint", {
    path: "/jenkins-home",
    posixUser: {
      uid: '1000',
      gid: '1000'
    },
    createAcl: {
      ownerGid: '1000',
      ownerUid: '1000',
      permissions: '755'
    }
  })

  return {
    fileSystem,
    accessPoint
  }
}