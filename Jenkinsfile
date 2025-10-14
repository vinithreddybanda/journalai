pipeline {
    agent any

    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
        // Set via Jenkins Credentials (Manage Jenkins > Credentials)
        // Create two Secret text credentials with IDs: 'supabase-url' and 'supabase-anon-key'
        // Alternatively, define these as job-level environment variables.
        NEXT_PUBLIC_SUPABASE_URL = credentials('supabase-url')
        NEXT_PUBLIC_SUPABASE_ANON_KEY = credentials('supabase-anon-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate required env') {
            steps {
                bat """
                @echo off
                if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
                    echo ERROR: NEXT_PUBLIC_SUPABASE_URL is not set (configure Jenkins credentials or job env vars).
                    exit /b 1
                ) else (
                    echo NEXT_PUBLIC_SUPABASE_URL is present
                )
                if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
                    echo ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set (configure Jenkins credentials or job env vars).
                    exit /b 1
                ) else (
                    echo NEXT_PUBLIC_SUPABASE_ANON_KEY is present
                )
                """
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
