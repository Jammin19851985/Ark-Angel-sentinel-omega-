#!/bin/bash
echo "Setting up Google Cloud Vertex credentials for Gemini CLI..."
export GOOGLE_GENAI_USE_VERTEXAI=true
read -p "Enter your Google Cloud Project ID: " GCP_PROJECT_ID
export GOOGLE_CLOUD_PROJECT=$GCP_PROJECT_ID
gcloud config set project $GCP_PROJECT_ID
gcloud auth application-default login
echo "Authentication configuration complete. Launching terminal interface context."
