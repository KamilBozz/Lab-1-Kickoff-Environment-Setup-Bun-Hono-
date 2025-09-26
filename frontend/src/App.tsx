// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { AppCard } from './components/ui/AppCard'
import { ExpensesList } from './components/ExpensesList'
import { AddExpenseForm } from './components/AddExpenseForm'


export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="mt-1 text-sm text-gray-600">Powered by TanStack Query</p>
        <AddExpenseForm />
        <ExpensesList />
      </div>
    </main>
  )
}