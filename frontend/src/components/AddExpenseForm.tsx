import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function AddExpenseForm() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number | ''>('')

  const createExpense = useMutation({
    mutationFn: async (payload: { title: string; amount: number }) => {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      return res.json() as Promise<{ expense: { id: number; title: string; amount: number } }>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setTitle('')
      setAmount('')
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (title && typeof amount === 'number') {
          createExpense.mutate({ title, amount })
        }
      }}
      className="mt-6 flex gap-2"
    >
      <input
        className="w-1/2 rounded border p-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-40 rounded border p-2"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
        required
      />
      <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={createExpense.isPending}>
        {createExpense.isPending ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}
