# Build Stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy all files to the container
COPY . ./

# Build the app
RUN npm run build --production

# Production Stage
FROM nginx:stable-alpine

# Copy the build output to the NGINX html folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
