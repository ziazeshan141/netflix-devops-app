pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-2"

        ECR_REGISTRY = "<YOUR_ACCOUNT_ID>.dkr.ecr.us-east-2.amazonaws.com"

        FRONTEND_IMAGE = "${ECR_REGISTRY}/netflix-frontend"

        BACKEND_IMAGE = "${ECR_REGISTRY}/netflix-backend"

        GITOPS_REPO = "https://github.com/<YOUR_GITHUB_USERNAME>/netflix-devops-gitops.git"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Scan') {
            steps {
                echo 'SonarQube scan will be configured in the next phase'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh 'trivy fs .'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t ${BACKEND_IMAGE}:latest backend'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t ${FRONTEND_IMAGE}:latest frontend'
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login --username AWS --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                docker push ${BACKEND_IMAGE}:latest
                docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Update GitOps Repository') {
            steps {
                echo 'Will update Helm values.yaml in netflix-devops-gitops'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}