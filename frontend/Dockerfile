# Stage 1: Build stage
FROM nginx:alpine as builder

WORKDIR /app

COPY index.html .
COPY nginx.conf .

# Stage 2: Final stage
FROM nginx:alpine

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy config from builder
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# Copy HTML
COPY --from=builder /app/index.html /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
