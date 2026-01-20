import router from './routes/router.jsx'
import { RouterProvider } from 'react-router-dom'
import { UserProvider } from './contexts/UserProvider.jsx'
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from './contexts/ThemeProvider.jsx';

function App() {
  const { theme } = useTheme();
  return (
    <>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
      <Toaster
        position="top-right"
        richColors
        theme={theme}
        expand={true}
        visibleToasts={5}
        closeButton
        toastOptions={{
          style: {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          },
          className: 'toast-notification',
        }}
      />
    </>
  )
}

export default App
