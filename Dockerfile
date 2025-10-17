# syntax=docker/dockerfile:1
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build frontend
COPY frontend/package.json frontend/bun.lock ./frontend/
RUN cd frontend && bun install --frozen-lockfile
COPY frontend ./frontend
RUN cd frontend && bun run build

# Copy server and compiled frontend to ./server/public
COPY server ./server
RUN mkdir -p server/public && cp -r frontend/dist/* server/public/

# Start runtime image
FROM oven/bun:1 as runtime
WORKDIR /app
COPY --from=base /app /app

# Set production environment
ENV NODE_ENV=production
EXPOSE 3000

# Health check for Render
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.text()).then(t => t === 'ok' ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["bun", "run", "server/index.ts"]
