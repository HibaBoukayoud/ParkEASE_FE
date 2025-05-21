# Step 1: build Angular
FROM node:20 as builder

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

# Step 2: serve con nginx
FROM nginx:alpine
COPY --from=builder /app/dist/parcheggio-frontend/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
