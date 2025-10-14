pipeline {
    agent any

    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
        // Optionally set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as
        // job-level environment variables or Jenkins credentials. If not present,
        // we'll write a .env.local with safe fallbacks for the build.
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare env file') {
            steps {
                bat """
                @echo off
                setlocal EnableDelayedExpansion
                set URL=%NEXT_PUBLIC_SUPABASE_URL%
                if "!URL!"=="" set URL=https://placeholder.supabase.co
                set KEY=%NEXT_PUBLIC_SUPABASE_ANON_KEY%
                if "!KEY!"=="" set KEY=dummy-anon-key
                (echo NEXT_PUBLIC_SUPABASE_URL=!URL!)> .env.local
                (echo NEXT_PUBLIC_SUPABASE_ANON_KEY=!KEY!)>> .env.local
                echo Created .env.local for build
                type .env.local
                endlocal
                """
            }
        }

        stage('Validate env (non-fatal)') {
            steps {
                bat """
                @echo off
                if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
                    echo WARN: NEXT_PUBLIC_SUPABASE_URL not set in Jenkins env. Using .env.local fallback.
                ) else (
                    echo NEXT_PUBLIC_SUPABASE_URL present in Jenkins env.
                )
                if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
                    echo WARN: NEXT_PUBLIC_SUPABASE_ANON_KEY not set in Jenkins env. Using .env.local fallback.
                ) else (
                    echo NEXT_PUBLIC_SUPABASE_ANON_KEY present in Jenkins env.
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
