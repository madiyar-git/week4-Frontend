#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=false
ENVIRONMENT=""

usage() {
    echo "Usage: $0 <staging|production> [--dry-run]"
    exit 1
}

if [ $# -lt 1 ]; then
    echo "❌ Error: Missing required environment argument."
    usage
fi

ENVIRONMENT="$1"
shift

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Error: Invalid environment '$ENVIRONMENT'. Must be 'staging' or 'production'."
    usage
fi

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "❌ Error: Unknown option '$1'"
            usage
            ;;
    esac
done

echo "🚀 Starting Frontend deployment to environment: [$ENVIRONMENT]"
if [ "$DRY_RUN" = true ]; then
    echo "ℹ️  RUNNING IN DRY-RUN MODE"
fi
echo "--------------------------------------------------------"

execute_step() {
    local step_name="$1"
    local command="$2"

    echo "▶️ [$step_name]..."
    if [ "$DRY_RUN" = true ]; then
        echo "   [DRY-RUN] Would execute: $command"
    else
        eval "$command"
    fi
    echo "✅ [$step_name] completed."
    echo ""
}

execute_step "1. Fetching latest codebase" "git pull origin main"
execute_step "2. Building Frontend Assets / Images" "npm run build"
execute_step "3. Restarting Frontend Service" "docker compose restart frontend"

echo "▶️ [4. Running Service Healthcheck]..."
if [ "$DRY_RUN" = true ]; then
    echo "   [DRY-RUN] Would execute: curl -f http://localhost:5173"
else
    if curl -s -f http://localhost:5173 > /dev/null; then
        echo "✅ Healthcheck passed!"
    else
        echo "❌ Healthcheck failed!"
        exit 1
    fi
fi

echo "--------------------------------------------------------"
echo "🎉 Frontend Deployment to [$ENVIRONMENT] finished successfully!"