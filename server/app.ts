// server/app.ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/serve-static'
import { expensesRoute } from './routes/expenses'
import { cors } from 'hono/cors'
import { authRoute } from './auth/kinde'
// server/app.ts
import { secureRoute } from './routes/secure'
import { uploadRoute } from './routes/upload'




export const app = new Hono()

// CORS configuration for development
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Global logger (from Lab 1)
app.use('*', logger())

// Custom timing middleware
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  // Add a response header so we can see timings in curl or other clients
  c.header('X-Response-Time', `${ms}ms`)
})

// Health endpoint
app.get('/health', (c) => c.text('ok'))

// Mount API routes (must be before static file serving)
app.route('/api/auth', authRoute)
app.route('/api/secure', secureRoute)
app.route('/api/expenses', expensesRoute)
app.route('/api/upload', uploadRoute)

// Static assets serving
app.use('/*', serveStatic({ root: './server/public' }))

// SPA fallback for client-side routing: for non-API, non-file requests
app.get('*', async (c, next) => {
  const url = new URL(c.req.url)
  if (url.pathname.startsWith('/api')) return next()
  // serve index.html for SPA routing
  return c.html(await Bun.file('./server/public/index.html').text())
})

export default app