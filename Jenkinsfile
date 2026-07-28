pipeline {
    agent any

    tools {
        jdk 'JDK21'
        nodejs 'Node22'
    }

    environment {
        AWS_REGION     = 'us-east-1'
        AWS_ACCOUNT_ID = '047385030300'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_IMAGE  = 'netflix-devops-backend'
        FRONTEND_IMAGE = 'netflix-devops-frontend'

        IMAGE_TAG = "${BUILD_NUMBER}"

        GITOPS_REPO = 'https://github.com/ziazeshan141/netflix-devops-gitops.git'
    }

    stages {

        stage('Checkout Source') {
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

       stage('SonarQube Analysis') {
           steps {
               script {
                   def scannerHome = tool 'SonarQubeScanner'
            
                   withSonarQubeEnv('SonarQube') { 
                       sh """
                           ${scannerHome}/bin/sonar-scanner \
                           -Dsonar.projectKey="netflix-devops" \
                           -Dsonar.projectName="Netflix DevOps" \
                           -Dsonar.sources="backend,frontend"
                     """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL .'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh """
                docker build \
                -t ${ECR_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG} \
                ./backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh """
                docker build \
                -t ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                ./frontend
                """
            }
        }

        stage('Trivy Backend Image Scan') {
            steps {
                sh """
                trivy image \
                --severity HIGH,CRITICAL \
                ${ECR_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}
                """                                                    
            }

        }

        stage('Trivy Frontend Image Scan') {
            steps {
                sh """
                trivy image \
                --severity HIGH,CRITICAL \
                ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Generate trivy report') {
            steps {
                sh """
                   # Ensure output folder exists before Trivy writes to it
                   mkdir -p reports
                   trivy image \
                   --format template \
                   -o reports/backend-report.txt \
                   ${ECR_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}

                   trivy image \
                   --format template \
                   -o reports/frontend-report.txt \
                   ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Login to Amazon ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region ${AWS_REGION} | \
                docker login \
                --username AWS \
                --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh """
                docker push ${ECR_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh """
                docker push ${ECR_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Update GitOps Repository') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_TOKEN'
                )]) {

                    sh '''
                    rm -rf gitops

                    git clone https://${GIT_USERNAME}:${GIT_TOKEN}@github.com/ziazeshan141/netflix-devops-gitops.git gitops

                    cd gitops

                    sed -i "s/tag:.*/tag: ${IMAGE_TAG}/" helm/netflix/values.yaml

                    git config user.email "jenkins@example.com"
                    git config user.name "Jenkins CI"

                    git add .

                    git commit -m "Update image tag ${IMAGE_TAG}" || true

                    git push
                    '''
                }
            }
        }

    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/*', fingerprint: true
            cleanWs()
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}   