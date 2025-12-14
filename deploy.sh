#!/bin/bash
set -e

# Ensure we are in the correct directory
cd "$(dirname "$0")"

# Load .env variables
if [ -f .env ]; then
  echo "Loading .env file..."
  set -a
  source .env
  set +a
  echo "DEBUG: Loaded API_KEY=${VITE_FIREBASE_API_KEY:0:5}..."
else
  echo "Error: .env file not found in opennow directory!"
  echo "Please create opennow/.env with the following variables:"
  echo "VITE_FIREBASE_API_KEY"
  echo "VITE_FIREBASE_AUTH_DOMAIN"
  echo "VITE_FIREBASE_PROJECT_ID"
  echo "VITE_FIREBASE_STORAGE_BUCKET"
  echo "VITE_FIREBASE_MESSAGING_SENDER_ID"
  echo "VITE_FIREBASE_APP_ID"
  echo "VITE_FIREBASE_MEASUREMENT_ID"
  exit 1
fi

echo "DEBUG: Checking firebase.ts content..."
# Hardcode all Firebase Config to ensure it's picked up by Vite build
sed -i "" "s|import.meta.env.VITE_FIREBASE_API_KEY|\"$VITE_FIREBASE_API_KEY\"|g" src/lib/firebase.ts
sed -i "" "s|import.meta.env.VITE_FIREBASE_AUTH_DOMAIN|\"$VITE_FIREBASE_AUTH_DOMAIN\"|g" src/lib/firebase.ts
sed -i "" "s|import.meta.env.VITE_FIREBASE_PROJECT_ID|\"$VITE_FIREBASE_PROJECT_ID\"|g" src/lib/firebase.ts
sed -i "" "s|import.meta.env.VITE_FIREBASE_STORAGE_BUCKET|\"$VITE_FIREBASE_STORAGE_BUCKET\"|g" src/lib/firebase.ts
sed -i "" "s|import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|\"$VITE_FIREBASE_MESSAGING_SENDER_ID\"|g" src/lib/firebase.ts
sed -i "" "s|import.meta.env.VITE_FIREBASE_APP_ID|\"$VITE_FIREBASE_APP_ID\"|g" src/lib/firebase.ts
sed -i "" "s|import.meta.env.VITE_FIREBASE_MEASUREMENT_ID|\"$VITE_FIREBASE_MEASUREMENT_ID\"|g" src/lib/firebase.ts

cat src/lib/firebase.ts

echo "Building and submitting to Cloud Build..."
gcloud builds submit --quiet --tag gcr.io/micro-shoreline-479319-r2/opennow .

echo "Deploying to Cloud Run..."
# We also pass GOOGLE_CLIENT_ID and SECRET if they exist in .env, as requested
gcloud run deploy opennow \
  --quiet \
  --image gcr.io/micro-shoreline-479319-r2/opennow \
  --platform managed \
  --region us-central1 \
  --memory 1Gi \
  --cpu 1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --set-env-vars NODE_ENV=production,VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY",VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN",VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID",VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET",VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID",VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID",VITE_FIREBASE_MEASUREMENT_ID="$VITE_FIREBASE_MEASUREMENT_ID",GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID",GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET",GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY",GEMINI_API_KEY="$GEMINI_API_KEY",ADMIN_PANEL_PASSWORD="$ADMIN_PANEL_PASSWORD"

echo "Deployment complete!"
