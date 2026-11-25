# Servidor MCP HTTP para inprotar.cl (VPS / Docker)
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY mcp ./mcp
COPY src/lib/content/schema.ts ./src/lib/content/schema.ts
USER node
ENV NODE_ENV=production PORT=3101 HOST=0.0.0.0
EXPOSE 3101
CMD ["./node_modules/.bin/tsx", "mcp/node-http.ts"]
