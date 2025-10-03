import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AppCard } from './components/ui/AppCard'
import { ExpensesList } from './components/ExpensesList'
import { AddExpenseForm } from './components/AddExpenseForm'
import { Link, Outlet } from '@tanstack/react-router'

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-4xl p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Expenses App</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/">Home</Link>
            <Link to="/expenses">Expenses</Link>
            <Link to="/expenses/new">New</Link>
          </nav>
        </header>
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
