import { RouterProvider, createRouter, createRootRoute, createRoute, useParams } from '@tanstack/react-router'
import App from './App'
import ExpensesListPage from './routes/expenses.list'
import ExpenseDetailPage from './routes/expenses.detail'
import ExpenseNewPage from './routes/expenses.new'

const rootRoute = createRootRoute({
  component: () => <App />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <p>Home Page</p>,
})

const expensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenses',
  component: () => <ExpensesListPage />,
})


const expensesDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/expenses/$id',
  
    component: () =>{ 
      const { id } = useParams({from: expensesDetailRoute.id})
        return <ExpenseDetailPage id={Number(id)}/>
      },
})


const expensesNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/expenses/new',
    component: () => <ExpenseNewPage />,
  })

const routeTree = rootRoute.addChildren([indexRoute, expensesRoute, expensesDetailRoute, expensesNewRoute])

export const router = createRouter({ routeTree })

export function AppRouter() {
  return <RouterProvider router={router} />
}


router.update({
    defaultNotFoundComponent: () => <p>Page not found</p>,
    defaultErrorComponent: ({ error }) => <p>Error: {(error as Error).message}</p>,
  })
  