#!/bin/bash

while true; do
    # Check if there are any changes
    if [[ $(git status --porcelain) ]]; then
        # Add all changes
        git add .
        
        # Create a commit with timestamp
        git commit -m "auto-save: $(date '+%Y-%m-%d %H:%M:%S')"
        
        # Push to remote
        git push origin main
        
        echo "Changes auto-saved at $(date '+%Y-%m-%d %H:%M:%S')"
    else
        echo "No changes to save at $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Wait for 5 minutes
    sleep 300
done
