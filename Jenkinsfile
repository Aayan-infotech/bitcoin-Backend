pipeline {
    agent any

    environment {
        IMAGE_NAME = "docker.io/aayanindia/bitcoin-backend"
        CONTAINER_PORT = "3210"
        HOST_PORT = "3210"
        DOCKER_HUB_USERNAME = credentials('docker-hub-username') // Store in Jenkins Credentials
        DOCKER_HUB_PASSWORD = credentials('docker-hub-password') // Store in Jenkins Credentials
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Run ESLint') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Running ESLint..."
                    npm run lint || echo "⚠️ ESLint completed with errors, but continuing pipeline..."
                    '''
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Logging in to Docker Hub..."
                    if echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin; then
                        echo "✅ Docker Hub login successful!"
                    else
                        echo "❌ ERROR: Docker Hub login failed! Check credentials in Jenkins."
                        exit 1
                    fi
                    '''
                }
            }
        }

        stage('Check If Image Exists') {
            steps {
                script {
                    def imageExists = sh(
                        script: '''
                        #!/bin/bash
                        curl -s -o /dev/null -w "%{http_code}" \
                        https://hub.docker.com/v2/repositories/aayanindia/bitcoin-backend/tags/latest
                        ''',
                        returnStdout: true
                    ).trim()

                    if (imageExists == "200") {
                        echo "✅ Image exists on Docker Hub, will update it."
                        env.IMAGE_EXISTS = "true"
                    } else {
                        echo "🚀 First-time push: Image does not exist on Docker Hub."
                        env.IMAGE_EXISTS = "false"
                    }
                }
            }
        }

        stage('Generate Next Image Tag') {
            steps {
                script {
                    def latestTag = sh(
                        script: '''
                        #!/bin/bash
                        curl -s https://hub.docker.com/v2/repositories/aayanindia/bitcoin-backend/tags/ | \
                        jq -r '.results[].name' | grep -E '^stage-v[0-9]+$' | sort -V | tail -n1 | awk -F'v' '{print $2}'
                        ''',
                        returnStdout: true
                    ).trim()

                    def newTag = latestTag ? "stage-v${latestTag.toInteger() + 1}" : "stage-v1"
                    env.NEW_STAGE_TAG = newTag
                    echo "🆕 New Docker Image Tag: ${newTag}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Building Docker image..."
                    docker build -t ${IMAGE_NAME}:latest . 2>&1 | tee failure.log
                    '''
                }
            }
        }

        stage('Tag Docker Image') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Tagging Docker image..."
                    docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${NEW_STAGE_TAG}
                    docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:prodv1
                    '''
                }
            }
        }

        stage('Security Scan with Trivy') {
            when {
                expression { return env.IMAGE_EXISTS == "true" }
            }
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Running Trivy security scan..."
                    if docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image \
                        --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:${NEW_STAGE_TAG}; then
                        echo "✅ Trivy scan completed!"
                    else
                        echo "⚠️ Trivy scan found vulnerabilities, but continuing pipeline..."
                    fi
                    '''
                }
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Pushing Docker images to Docker Hub..."
                    docker push ${IMAGE_NAME}:${NEW_STAGE_TAG}
                    docker push ${IMAGE_NAME}:prodv1
                    '''
                }
            }
        }

        stage('Cleanup Old Docker Images') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Cleaning up old Docker images..."
                    OLD_IMAGES=$(docker images ${IMAGE_NAME} --format "{{.Tag}}" | grep 'stage-v' | sort -V | head -n -4)
                    for tag in $OLD_IMAGES; do
                        docker rmi ${IMAGE_NAME}:$tag || true
                    done
                    '''
                }
            }
        }

        stage('Stop Existing Container') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Stopping existing container..."
                    CONTAINER_ID=$(docker ps -q --filter "publish=${HOST_PORT}")
                    if [ -n "$CONTAINER_ID" ]; then
                        docker stop "$CONTAINER_ID" || true
                        docker rm "$CONTAINER_ID" || true
                    else
                        echo "No container running on port ${HOST_PORT}"
                    fi
                    '''
                }
            }
        }

        stage('Run New Docker Container') {
            steps {
                script {
                    sh '''
                    #!/bin/bash
                    echo "Starting new container..."
                    docker run -d -p ${HOST_PORT}:${CONTAINER_PORT} ${IMAGE_NAME}:${NEW_STAGE_TAG}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline execution successful!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}
