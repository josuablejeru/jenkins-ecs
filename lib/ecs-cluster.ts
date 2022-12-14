import {
  aws_ecs as ecs,
  aws_ec2 as ec2,
  aws_ecs_patterns as ecsPatterns,
  aws_efs as efs,
  Duration,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'


export const buildVPC = (scope: Construct): ec2.IVpc => {
  const vpc = new ec2.Vpc(scope, "JenkinsVPC", {
    vpcName: "Jenkins VPC",
    cidr: "10.0.0.0/16",
    natGateways: 1,
    maxAzs: 2,
  })

  return vpc
}


export const buildCluster = (scope: Construct, vpc: ec2.IVpc, name: string): ecs.ICluster => {
  const cluster = new ecs.Cluster(scope, 'JenkinsCluster', {
    vpc,
    clusterName: name
  })

  return cluster
}

type JenkinsFargateServiceProps = {
  cluster: ecs.ICluster
  fileSystem: efs.IFileSystem
  accessPoint: efs.IAccessPoint
}

export const buildJenkinsFargateService = (scope: Construct, props: JenkinsFargateServiceProps): ecsPatterns.ApplicationLoadBalancedFargateService => {

  const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(scope, "JenkinsService", {
    cluster: props.cluster,
    memoryLimitMiB: 4096,
    desiredCount: 1,
    cpu: 1024,
    taskImageOptions: {
      image: ecs.ContainerImage.fromAsset("./docker/jenkins/"),
      containerPort: 8080,
      logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: 'jenkins' }),
    },
    loadBalancerName: 'jenkins-alb',
    maxHealthyPercent: 100,
    minHealthyPercent: 0,
    healthCheckGracePeriod: Duration.minutes(5)
  })

  loadBalancedFargateService.taskDefinition.addVolume({
    name: 'jenkins-home',
    efsVolumeConfiguration: {
      fileSystemId: props.fileSystem.fileSystemId,
      transitEncryption: 'ENABLED',
      authorizationConfig: {
        accessPointId: props.accessPoint.accessPointId,
        iam: 'ENABLED'
      }
    }
  })

  loadBalancedFargateService.taskDefinition.defaultContainer?.addMountPoints({
    containerPath: '/var/jenkins_home',
    sourceVolume: 'jenkins-home',
    readOnly: false
  })

  loadBalancedFargateService.service.connections.allowTo(props.fileSystem, ec2.Port.tcp(2049));

  return loadBalancedFargateService
}
