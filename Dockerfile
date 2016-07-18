FROM node:4-onbuild

ENV NODE_ENV production
ENV PORT 80
ENV SSL_PORT 443
ENV LETSENCRYPT_DIR /etc/letsencrypt
ENV LETSENCRYPT_EMAIL your@email.here
ENV LETSENCRYPT_TOS true

VOLUME ["/etc/letsencrypt"]

EXPOSE 80
