# Build 
FROM node:18-alpine3.16 as build

ENV NODE_ENV production

WORKDIR /app
RUN mkdir -p /node_modules && chown node:node -R /node_modules /app

USER node

COPY --chown=node:node package*.json ./

RUN npm install
RUN npx prisma generate

COPY --chown=node:node . ./
RUN chmod +x ./node_modules/.bin/nest

RUN npm run build

# Product
FROM node:18-alpine3.16 as production
COPY --chown=node:node --from=build /app/package.json ./
COPY --chown=node:node --from=build /app/.env ./
COPY --chown=node:node --from=build /app/prisma ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
RUN npx prisma generate
