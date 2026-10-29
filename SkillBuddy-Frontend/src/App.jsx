import { RouterProvider } from 'react-router'
import { router } from './app.routes.jsx'
import React, { useState, useEffect } from 'react'
import { AuthProvider } from './auth.context.jsx'
import Loader from './components/Loader/Loader.jsx'


function App() {

  const [isLoading, setIsLoading] = useState(true)
  const [isFading, setIsFading] = useState(false);


  useEffect(() => {
    // 3. Set a timer for 2 seconds (2000 milliseconds)
    const fadeTimer = setTimeout(() => setIsFading(true), 1700);

    const exitTimer = setTimeout(() => setIsLoading(false), 2000);


    // Clean up timer if component unmounts
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(exitTimer)
    }

  }, [])

  // 4. If loading, display only the loading screen
  if (isLoading) {
    return <Loader />
  }

  // 5. Otherwise, display the application

  return (

    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>

  )
}

export default App
