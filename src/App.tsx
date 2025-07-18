import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Resources } from './pages/Resources'
import { Checks } from './pages/Checks'
import { Events } from './pages/Events'
import { Toaster } from './components/ui/toaster'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Welcome to UptimeWatch</h1>
            <p className="text-muted-foreground mb-6">Please sign in to continue</p>
            <button
              onClick={() => blink.auth.login()}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <div className="lg:pl-64">
            <main className="py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/checks" element={<Checks />} />
                <Route path="/events" element={<Events />} />
                <Route path="/notifications" element={<div className="text-foreground">Notifications Page (Coming Soon)</div>} />
                <Route path="/settings" element={<div className="text-foreground">Settings Page (Coming Soon)</div>} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App