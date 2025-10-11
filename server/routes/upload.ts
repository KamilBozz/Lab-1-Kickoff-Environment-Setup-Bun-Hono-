import { Hono } from 'hono'
import { requireAuth } from '../auth/requireAuth'
import { s3 } from '../lib/s3'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const uploadRoute = new Hono()
  .post('/sign', async (c) => {
    const err = await requireAuth(c)
    if (err) return err

    const { filename, type } = await c.req.json()
    const key = `uploads/${Date.now()}-${filename}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: type,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })
    return c.json({ uploadUrl, key })
  })

  .get('/signedUrl/:fileKey', async (c) => {
    const err = await requireAuth(c)
    if (err) return err

    const { fileKey } = c.req.param()
    console.log("fileKey", fileKey)

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: fileKey,
    })
    console.log("command", command)
    const url = await getSignedUrl(s3, command, { expiresIn: 600 })
    return c.json({ url })
  })
