// server/app.ts
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { expensesRoute } from './routes/expenses'
import { cors } from 'hono/cors'
import { authRoute } from './auth/kinde'
import { secureRoute } from './routes/secure'
import { uploadRoute } from './routes/upload'




export const app = new Hono()

// CORS configuration - only needed in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/*', cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }))
}

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

// Static assets serving and SPA fallback
app.get('*', async (c, next) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname
  
  // Skip API routes
  if (pathname.startsWith('/api')) return next()
  
  // Try to serve static files
  const publicPath = `./server/public${pathname}`
  
  try {
    const file = Bun.file(publicPath)
    const exists = await file.exists()
    
    if (exists) {
      // Determine content type based on file extension
      const ext = pathname.split('.').pop()?.toLowerCase()
      let contentType = 'text/plain'
      
      switch (ext) {
        case 'html':
          contentType = 'text/html'
          break
        case 'css':
          contentType = 'text/css'
          break
        case 'js':
          contentType = 'application/javascript'
          break
        case 'json':
          contentType = 'application/json'
          break
        case 'png':
          contentType = 'image/png'
          break
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        case 'svg':
          contentType = 'image/svg+xml'
          break
        case 'ico':
          contentType = 'image/x-icon'
          break
      }
      
      c.header('Content-Type', contentType)
      return c.body(await file.arrayBuffer())
    }
  } catch (error) {
    // File doesn't exist or error reading, fall through to SPA fallback
  }
  
  // SPA fallback - serve index.html for client-side routing
  try {
    const indexFile = Bun.file('./server/public/index.html')
    const indexContent = await indexFile.text()
    c.header('Content-Type', 'text/html')
    return c.html(indexContent)
  } catch (error) {
    return c.text('Not Found', 404)
  }
})

export default app