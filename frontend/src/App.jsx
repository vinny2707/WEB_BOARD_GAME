import { useState } from 'react'
import router from './routes/router.jsx'
import { RouterProvider } from 'react-router-dom'
import { UserProvider } from './contexts/UserProvider.jsx'

function App() {

  return (
    <>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </>
  )
}

export default App
