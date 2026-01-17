FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY doc/package*.json ./
RUN npm install

# Copy application source
COPY doc/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

