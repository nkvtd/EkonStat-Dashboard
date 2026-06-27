FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY default.conf.template /etc/nginx/templates/default.conf.template
RUN rm -rf /usr/share/nginx/html && mkdir -p /usr/share/nginx/html
COPY --from=builder /app/dist/client/ /usr/share/nginx/html/

EXPOSE 80