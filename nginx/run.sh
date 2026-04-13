#!/bin/sh
set -eu

CERT_DIR="/etc/letsencrypt/live/${DOMAIN_NAME}"
FULLCHAIN_PATH="${CERT_DIR}/fullchain.pem"
PRIVKEY_PATH="${CERT_DIR}/privkey.pem"

TEMPLATE_PATH="/etc/nginx/templates/nginx.bootstrap.template"

if [ -f "$FULLCHAIN_PATH" ] && [ -f "$PRIVKEY_PATH" ]; then
  TEMPLATE_PATH="/etc/nginx/templates/nginx.template"
fi

envsubst '$DOMAIN_NAME $CLIENT_PORT $CORE_PORT $SFU_PORT' < "$TEMPLATE_PATH" > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
