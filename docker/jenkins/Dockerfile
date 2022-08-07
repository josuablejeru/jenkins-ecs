FROM jenkins/jenkins:lts


COPY casc.yaml /var/jenkins_home/casc.yaml
ENV CASC_JENKINS_CONFIG /var/jenkins_home/casc.yaml

# install jenkins plugins
COPY ./plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

# allows to skip Jenkins setup wizard
ENV JAVA_OPTS -Djenkins.install.runSetupWizard=false

VOLUME /var/jenkins_home
