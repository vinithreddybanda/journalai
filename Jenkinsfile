pipeline {
    agent any

    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Node.js Info') {
            steps {
                bat """
                node --version
                npm --version
                """
            }
        }

        stage('Install dependencies') {
            steps {
                bat """
                if exist package-lock.json (
                  echo Detected package-lock.json - using npm ci
                  call npm ci
                ) else (
                  echo No package-lock.json found - using npm install
                  call npm install
                )
                """
            }
        }

        stage('Lint') {
            steps {
                bat "call npm run lint"
            }
        }

        stage('Type Check') {
            steps {
                bat "call npm run type-check"
            }
        }

        stage('Build') {
            steps {
                bat "call npm run build"
            }
        }

        stage('Test') {
            steps {
                bat "call npm test"
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '.next/**, package.json, next.config.*', allowEmptyArchive: false
        }
    }
}
