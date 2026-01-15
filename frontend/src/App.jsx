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
      <Toaster position="top-center" richColors theme={theme} />
    </>
  )
}

export default App
