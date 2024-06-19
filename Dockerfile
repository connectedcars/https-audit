ARG NODE_VERSION=stable

FROM gcr.io/connectedcars-staging/node-builder.master:$NODE_VERSION as builder

ARG COMMIT_SHA=master

WORKDIR /app

USER builder

# Copy application code.
COPY --chown=builder:builder . /app

RUN npm ci

RUN npm run build

# Run ci checks
RUN npm run ci-tsc
RUN npm run ci-jest
RUN npm run ci-audit
RUN npm run ci-eslint

# Continue build
FROM gcr.io/connectedcars-staging/node-base.master:$NODE_VERSION

USER nobody

ENV NODE_ENV production

WORKDIR /app

EXPOSE 3100

COPY --from=builder /app .

CMD ["node", "build/dist/src/start.js"]
