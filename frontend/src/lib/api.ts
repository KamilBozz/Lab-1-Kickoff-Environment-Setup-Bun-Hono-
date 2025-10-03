// /frontend/src/lib/api.ts
export type HttpError = { status: number; message: string }

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw { status: res.status, message: text || res.statusText } as HttpError
  }
  // Handle empty 204
  if (res.status === 204) return undefined as unknown as T
  return (await res.json()) as T
}

const json = (body: unknown): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// Public API surface for your app
export const api = {
  getExpenses: () => request<{ expenses: { id: number; title: string; amount: number }[] }>(`/api/expenses`),
  createExpense: (payload: { title: string; amount: number }) =>
    request<{ expense: { id: number; title: string; amount: number } }>(`/api/expenses`, {
      method: 'POST',
      ...json(payload),
    }),
  deleteExpense: (id: number) => request<{ deleted: { id: number } }>(`/api/expenses/${id}`, { method: 'DELETE' }),
}
