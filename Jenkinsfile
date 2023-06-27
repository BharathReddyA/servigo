pipeline {
    agent {
        docker {
            image 'jenkins/jenkins:lts'
            args '--user root:root -p 8080:8080 -p 50000:50000 --link servigo-cont:mysql-db -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    options {
        skipDefaultCheckout()
    }

    stages {
        stage('Build') {
            steps {
                script {
                    docker.build('servigo-image', '.')
                }
            }
        }

        stage('Test') {
            steps {
                sh 'docker run --rm servigo-image npm test'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 3000:3000 --link servigo-cont:mysql-db --name servigo-app servigo-image'
            }
        }
    }
}
