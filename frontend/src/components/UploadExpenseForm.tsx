import { useState } from 'react'

// Frontend-only upload flow:
// 1) Ask backend for a signed URL (no file data leaves your server here).
// 2) Upload file directly to S3/Spaces using the signed URL.
// 3) Tell the backend which expense to update by sending the S3 object key.

export function UploadExpenseForm({ expenseId }: { expenseId: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!file) return

    try {
      setUploading(true)

      // 1) Get a signed upload URL from backend
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send cookies if needed
        body: JSON.stringify({ filename: file.name, type: file.type }),
      })
      if (!signRes.ok) {
        const msg = await signRes.text().catch(() => '')
        throw new Error(msg || `Sign URL failed (${signRes.status})`)
      }
      // Expect backend to return: { uploadUrl: string, key: string }
      const { uploadUrl, key } = (await signRes.json()) as {
        uploadUrl: string
        key: string
      }

      // const signResData = await signRes.json();
      // console.log('Got signed URL from backend:', signResData)

      // 2) Upload file directly to S3/Spaces with correct Content-Type
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!putRes.ok) {
        const msg = await putRes.text().catch(() => '')
        throw new Error(msg || `Upload failed (${putRes.status})`)
      }
      console.log('PUT req response from S3:', putRes)

      // 3) Update this expense with the file's S3 key (backend will sign downloads)
      const updateRes = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileKey: key }),
      })
      if (!updateRes.ok) {
        const msg = await updateRes.text().catch(() => '')
        throw new Error(msg || `Update failed (${updateRes.status})`)
      }

      // Success — optionally clear input
      setFile(null)
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />
      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={!file || isUploading}
      >
        {isUploading ? 'Uploading…' : 'Upload Receipt'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}