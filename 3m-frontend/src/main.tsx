import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import { RootLayout } from './components/RootLayout'
import { HomeView } from './features/home/HomeView'
import { ProductsView } from './features/products/ProductsView'
import { ProductDetailsView } from './features/products/ProductDetailsView'
import { CartView } from './features/cart/CartView'
import { ProfileView } from './features/user/ProfileView'
import { AboutView } from './features/about/AboutView'
import { FavoritesView } from './features/favorites/FavoritesView'
import { CheckoutView } from './features/checkout/CheckoutView'
import { OrderSuccessView } from './features/checkout/OrderSuccessView'
import { PaymentView } from './features/checkout/PaymentView'
import { ResetPasswordView } from './features/auth/ResetPasswordView'
import AdminDashboardView from './features/admin/AdminDashboardView'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomeView />,
      },
      {
        path: 'shop',
        element: <ProductsView />,
      },
      {
        path: 'product/:id',
        element: <ProductDetailsView />,
      },
      {
        path: 'cart',
        element: <CartView />,
      },
      {
        path: 'profile',
        element: <ProfileView />,
      },
      {
        path: 'about',
        element: <AboutView />,
      },
      {
        path: 'favorites',
        element: <FavoritesView />,
      },
      {
        path: 'checkout',
        element: <CheckoutView />,
      },
      {
        path: 'checkout/success',
        element: <OrderSuccessView />,
      },
      {
        path: 'checkout/payment',
        element: <PaymentView />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordView />,
      },
      {
        path: 'admin',
        element: <AdminDashboardView />,
      },
    ],
  },
])

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId} locale="ar">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)

