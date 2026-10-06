import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext.tsx'
import { AdminAuthProvider } from './context/AdminAuthContext.tsx'

import Layout from './Layout.tsx'
import App from './App.tsx'
import Login from './Login.tsx'
import Cadastro from './Cadastro.tsx'
import Detalhes from './Detalhes.tsx'
import MinhasCompras from './MinhasCompras.tsx'
import MinhasVendas from './MinhasVendas.tsx'
import VenderRoupa from './VenderRoupa.tsx'

import AdminLogin from './admin/AdminLogin.tsx'
import AdminLayout from './admin/AdminLayout.tsx'
import AdminDashboard from './admin/AdminDashboard.tsx'
import AdminPecas from './admin/AdminPecas.tsx'
import AdminClientes from './admin/AdminClientes.tsx'
import AdminPropostas from './admin/AdminPropostas.tsx'

const rotas = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'cadastro', element: <Cadastro /> },
      { path: 'detalhes/:pecaId', element: <Detalhes /> },
      { path: 'minhas-compras', element: <MinhasCompras /> },
      { path: 'minhas-vendas', element: <MinhasVendas /> },
      { path: 'minhas-propostas', element: <Navigate to="/minhas-compras" replace /> },
      { path: 'vender', element: <VenderRoupa /> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'pecas', element: <AdminPecas /> },
      { path: 'clientes', element: <AdminClientes /> },
      { path: 'propostas', element: <AdminPropostas /> },
      { path: 'ofertas', element: <Navigate to="/admin/pecas" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <RouterProvider router={rotas} />
      </AdminAuthProvider>
    </AuthProvider>
  </StrictMode>,
)
