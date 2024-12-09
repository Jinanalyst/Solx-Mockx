#!/bin/bash

check_and_save() {
    echo "Running type check..."
    # Run TypeScript type checking
    npm run typecheck 2>&1 || {
        echo "TypeScript errors found. Fixing..."
        # You might want to add automatic fixes here
        return 1
    }
    
    echo "Running lint..."
    # Run ESLint
    npm run lint 2>&1 || {
        echo "Linting errors found. Fixing..."
        npm run lint:fix 2>&1
    }
    
    # If there are any changes after fixes
    if [[ $(git status --porcelain) ]]; then
        echo "Changes detected, committing..."
        git add .
        git commit -m "auto-fix: $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo "Changes pushed at $(date '+%Y-%m-%d %H:%M:%S')"
    else
        echo "No changes to save at $(date '+%Y-%m-%d %H:%M:%S')"
    fi
}

while true; do
    check_and_save
    # Wait for 5 minutes
    sleep 300
done
