ARG CLIENT_IMAGE=space-client:latest
FROM ${CLIENT_IMAGE} AS client

FROM nginx:1.28.0-alpine-slim AS base
RUN mkdir -p /var/www/client/static
COPY --from=client /app/.output/public/_build /var/www/client/static
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.template
CMD ["/bin/sh", "-c", "envsubst '$$DOMAIN_NAME $$CLIENT_PORT $$CORE_PORT $$SFU_PORT' < /etc/nginx/nginx.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
