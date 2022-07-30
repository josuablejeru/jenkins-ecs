import {
  aws_ecs as ecs,
  aws_ec2 as ec2,
  aws_ecs_patterns as ec2_patterns,
  aws_efs as efs,
  Duration,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'


export const buildVPC = (scope: Construct): ec2.IVpc => {
  const vpc = new ec2.Vpc(scope, "JenkinsVPC", {
    vpcName: "Jenkins VPC",
    cidr: "10.0.0.0/16",
    natGateways: 0,
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

export const buildJenkinsFargateService = (scope: Construct, props: JenkinsFargateServiceProps) => {
  const taskDefinition = new ecs.FargateTaskDefinition(scope, 'jenkins-task-definition', {
    memoryLimitMiB: 1024,
    cpu: 512,
    family: 'jenkins'
  });

  taskDefinition.addVolume({
    name: 'jenkins-home',
    efsVolumeConfiguration: {
      fileSystemId: props.fileSystem.fileSystemId,
      transitEncryption: 'ENABLED',
      authorizationConfig: {
        accessPointId: props.accessPoint.accessPointId,
        iam: 'ENABLED'
      }
    }
  });

  const containerDefinition = taskDefinition.addContainer('jenkins', {
    image: ecs.ContainerImage.fromRegistry("jenkins/jenkins:lts"),
    logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'jenkins' }),
    portMappings: [{
      containerPort: 8080
    }]
  });
  containerDefinition.addMountPoints({
    containerPath: '/var/jenkins_home',
    sourceVolume: 'jenkins-home',
    readOnly: false
  });

  const service = new ecs.FargateService(scope, 'JenkinsService', {
    cluster: props.cluster,
    taskDefinition,
    desiredCount: 1,
    maxHealthyPercent: 100,
    minHealthyPercent: 0,
    healthCheckGracePeriod: Duration.minutes(5)
  });
  service.connections.allowTo(props.fileSystem, ec2.Port.tcp(2049));
}
