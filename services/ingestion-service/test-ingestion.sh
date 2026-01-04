#!/bin/bash

# Quick test script for the ingestion service

PROJECT_ID="job-recommendations-app"
SERVICE_URL="https://ingestion-service-608851044020.europe-north1.run.app"

# Get auth token
echo "Getting authentication token..."
TOKEN=$(gcloud auth print-identity-token --project=${PROJECT_ID})

if [ -z "$TOKEN" ]; then
    echo "Error: Failed to get auth token. Make sure you're logged in:"
    echo "  gcloud auth login"
    exit 1
fi

# Parse command line arguments or use defaults
QUERY="${1:-software engineer}"
COUNTRY="${2:-GB}"
NUM_PAGES="${3:-1}"

# URL encode the query
QUERY_ENCODED=$(echo -n "$QUERY" | jq -sRr @uri 2>/dev/null || python3 -c "import urllib.parse; print(urllib.parse.quote('$QUERY'))")

echo ""
echo "Testing ingestion service..."
echo "  Query: $QUERY"
echo "  Country: $COUNTRY"
echo "  Pages: $NUM_PAGES"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
  "${SERVICE_URL}/ingest?query=${QUERY_ENCODED}&country=${COUNTRY}&num_pages=${NUM_PAGES}" \
  -H "Authorization: bearer ${TOKEN}")

# Extract HTTP status and body
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')


#Commands added to if statements to test correct bucket and BigQuery data ingestion in dataset
echo "Response:"
echo "----------"
if [ "$HTTP_STATUS" == "200" ]; then
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "Success! Check:"
    echo "   - GCS: gsutil ls gs://jobs_ingestion_data_bucket/staging/jsearch/"
    echo "   - BigQuery: bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM \`job-recommendations-app.jobs_ds.jobs_jsearch_raw\`'"
else
    echo "Error (HTTP $HTTP_STATUS):"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "Check logs:"
    echo "  gcloud run services logs read ingestion-service --region=europe-north1 --project=${PROJECT_ID} --limit 20"
fi

