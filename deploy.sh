#!/bin/bash
echo "ElectionGuide AI - Deploying to Google App Engine..."
gcloud config set project fluid-crane-495210-s5
gcloud app deploy --quiet
