import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Frontend-only upload flow:
// 1) Ask backend for a signed URL (no file data leaves your server here).
// 2) Upload file directly to S3/Spaces using the signed URL.
// 3) Tell the backend which expense to update by sending the S3 object key.

export function UploadExpenseForm({ expenseId }: { expenseId: number }) {
  const qc = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1) Get a signed upload URL from backend
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: file.name, type: file.type }),
      })
      if (!signRes.ok) {
        const msg = await signRes.text().catch(() => '')
        throw new Error(msg || `Sign URL failed (${signRes.status})`)
      }
      
      const { uploadUrl, key } = (await signRes.json()) as {
        uploadUrl: string
        key: string
      }

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

      // 3) Update this expense with the file's S3 key
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

      return key
    },
    onSuccess: () => {
      setFile(null)
      setError(null)
      // Invalidate both the individual expense and the list
      qc.invalidateQueries({ queryKey: ['expenses', expenseId] })
      qc.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: (error) => {
      setError(error.message || 'Upload failed')
    },
  })

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!file) return
    uploadMutation.mutate(file)
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Upload Receipt</h3>
      <form onSubmit={handleUpload} className="space-y-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploadMutation.isPending}
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!file || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Uploading…
            </span>
          ) : (
            'Upload Receipt'
          )}
        </button>
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}
        {uploadMutation.isSuccess && (
          <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <p>Receipt uploaded successfully!</p>
          </div>
        )}
      </form>
    </div>
  )
}