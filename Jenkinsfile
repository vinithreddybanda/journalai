pipeline {
    agent any

    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
        // Option A: Set these as Jenkins credentials (recommended)
        // Create Secret text credentials with IDs: 'supabase-url' and 'supabase-anon-key'
        // Option B: Define NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY as job-level env vars
        SUPABASE_URL_CRED = credentials('supabase-url')
        SUPABASE_ANON_KEY_CRED = credentials('supabase-anon-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Export env from credentials (fallback)') {
            steps {
                bat """
                @echo off
                if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
                  set "NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL_CRED%"
                )
                if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
                  set "NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY_CRED%"
                )
                echo Ensured NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
                """
            }
        }

                stage('Validate required env') {
                        steps {
                                bat """
                                @echo off
                                if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
                                    echo ERROR: NEXT_PUBLIC_SUPABASE_URL is not set in Jenkins credentials.
                                    exit /b 1
                                ) else (
                                    echo NEXT_PUBLIC_SUPABASE_URL is present
                                )
                                if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
                                    echo ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in Jenkins credentials.
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
