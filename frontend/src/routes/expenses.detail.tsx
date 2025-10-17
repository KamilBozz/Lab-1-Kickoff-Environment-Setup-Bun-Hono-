// /frontend/src/routes/expenses.detail.tsx
import { useQuery } from '@tanstack/react-query'
import { UploadExpenseForm } from '../components/UploadExpenseForm'
import type { Expense } from '../components/AddExpenseForm'

const API = '/api' // Use relative URLs for production compatibility

export default function ExpenseDetailPage({ id }: { id: number }) {
  // useQuery caches by key ['expenses', id]
  const { data, isLoading, isError } = useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const res = await fetch(`${API}/expenses/${id}`)
      if (!res.ok) throw new Error(`Failed to fetch expense with id ${id}`)
      return res.json() as Promise<{ expense: Expense }>
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading expense…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <p>Could not load expense. Please try again.</p>
      </div>
    )
  }

  const item = data?.expense

  if (!item) {
    return <p className="p-6 text-sm text-muted-foreground">Expense not found.</p>
  }

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="rounded border bg-background text-foreground p-6">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Amount</p>
        <p className="text-lg tabular-nums">${item.amount}</p>
        {item.fileUrl ? (
          <a target="_blank" href={item.fileUrl} className="text-blue-600 hover:text-blue-800 underline">
            Download Receipt
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No receipt uploaded</p>
        )}
      </div>
      <UploadExpenseForm expenseId={item.id} />
    </section>
  )
}
