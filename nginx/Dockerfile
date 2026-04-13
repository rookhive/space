ARG CLIENT_IMAGE=space-client:latest
FROM ${CLIENT_IMAGE} AS client

FROM nginx:1.29.8 AS base
RUN mkdir -p /var/www/client/static /var/www/certbot /etc/nginx/templates
COPY --from=client /app/.output/public/_build /var/www/client/static
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/nginx.template
COPY nginx.bootstrap.conf /etc/nginx/templates/nginx.bootstrap.template
COPY run.sh /run.sh
RUN sed -i 's/\r$//' /run.sh && chmod +x /run.sh
CMD ["/run.sh"]
