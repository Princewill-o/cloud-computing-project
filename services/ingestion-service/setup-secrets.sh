#!/bin/bash

# Script to create/update secrets for ingestion service
# Primarily to test for API key saved as secrets
# Run this if secrets don't exist

set -e

PROJECT_ID="job-recommendations-app"

echo "Setting up secrets for ingestion service..."

# Check if rapidapi-key secret exists, if not create it
if ! gcloud secrets describe rapidapi-key --project=${PROJECT_ID} &>/dev/null; then
    echo "Creating rapidapi-key secret..."
    echo "Please enter your RapidAPI key (or press Enter to skip and create empty secret):"
    read -s RAPIDAPI_KEY

    if [ -z "$RAPIDAPI_KEY" ]; then
        echo "Creating empty secret. You'll need to add a version later."
        echo "" | gcloud secrets create rapidapi-key \
            --project=${PROJECT_ID} \
            --data-file=-
    else
        echo "$RAPIDAPI_KEY" | gcloud secrets create rapidapi-key \
            --project=${PROJECT_ID} \
            --data-file=-
    fi
else
    echo "Secret 'rapidapi-key' already exists."
    echo "To update it, run:"
    echo "  echo 'YOUR_KEY' | gcloud secrets versions add rapidapi-key --data-file=- --project=${PROJECT_ID}"
fi


# Service account already has access , code is no longer required
## Grant service account access to the secret
#SERVICE_ACCOUNT="ingestion-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"
#echo "Granting secret access to service account..."
#gcloud secrets add-iam-policy-binding rapidapi-key \
#    --project=${PROJECT_ID} \
#    --member="serviceAccount:${SERVICE_ACCOUNT}" \
#    --role="roles/secretmanager.secretAccessor" \
#    || echo "Warning: Could not grant access. Service account may not exist yet."

echo ""
echo "Secrets setup complete!"
echo ""
