#!/usr/bin/env bash
set -euo pipefail

# Expected environment variables (set by GitHub Actions):
#   S3_BUCKET   - S3 bucket name
#   S3_KEY      - S3 object key of the release tarball
#   GITHUB_SHA  - commit SHA (used for release directory name)

S3_BUCKET="${S3_BUCKET:?S3_BUCKET is required}"
S3_KEY="${S3_KEY:?S3_KEY is required}"
GITHUB_SHA="${GITHUB_SHA:?GITHUB_SHA is required}"

RELEASE_DIR="/opt/app/releases/${GITHUB_SHA}"
FRONTEND_ROOT="/usr/share/nginx/html"
BACKEND_DIR="/opt/app/backend"
SHARED_ENV="/opt/app/shared/backend.env"

echo "[deploy] Downloading artifact from s3://${S3_BUCKET}/${S3_KEY} ..."
aws s3 cp "s3://${S3_BUCKET}/${S3_KEY}" /tmp/deploy.tar.gz

echo "[deploy] Extracting to ${RELEASE_DIR} ..."
mkdir -p "${RELEASE_DIR}"
tar xzf /tmp/deploy.tar.gz -C /opt/app/releases/

echo "[deploy] Deploying frontend to ${FRONTEND_ROOT} ..."
rm -rf "${FRONTEND_ROOT:?}"/*
cp -r "${RELEASE_DIR}/frontend/"* "${FRONTEND_ROOT}/"

echo "[deploy] Deploying backend to ${BACKEND_DIR} ..."
rm -rf "${BACKEND_DIR}"
cp -r "${RELEASE_DIR}/backend" "${BACKEND_DIR}"
cp "${RELEASE_DIR}/start.sh" /opt/app/start.sh
chmod +x /opt/app/start.sh

echo "[deploy] Ensuring shared env file exists ..."
mkdir -p /opt/app/shared
if [ ! -f "${SHARED_ENV}" ]; then
  echo "[deploy] Creating ${SHARED_ENV} from example ..."
  cp "${BACKEND_DIR}/.env.production.example" "${SHARED_ENV}"
fi

echo "[deploy] Installing backend dependencies ..."
cd "${BACKEND_DIR}"
pip install -r requirements.txt --quiet --upgrade

echo "[deploy] Restarting backend service ..."
systemctl restart mw-backend || true

echo "[deploy] Cleaning up ..."
rm -f /tmp/deploy.tar.gz

echo "[deploy] Done."
