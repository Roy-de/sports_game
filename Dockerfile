# Stage 1: Build React frontend
FROM node:14 as frontend

WORKDIR /app/frontend

# Install dependencies and build the frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Express backend and serve frontend
FROM node:14

WORKDIR /app

# Install backend dependencies
COPY sports-prediction-backend/package*.json ./sports-prediction-backend/
RUN npm install --prefix sports-prediction-backend

# Copy backend code and frontend build files into the backend's static directory
COPY sports-prediction-backend ./sports-prediction-backend
COPY --from=frontend /app/frontend/build ./sports-prediction-backend/build

# Set environment variables for Google Cloud Run
ENV PORT=8080

# Expose the required port for Google Cloud Run
EXPOSE 8080

# Start the server
CMD ["node", "sports-prediction-backend/server.js"]
