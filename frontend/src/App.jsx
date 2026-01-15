import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ControlPanel from './components/ControlPanel'
import SubscribeForm from './components/SubscribeForm'
import SubscriberList from './components/SubscriberList'
import Alerts from './components/Alerts'
import { getLatestReading } from './services/api'

export default function App() {
  const [gasData, setGasData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch gas data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const data = await getLatestReading()
        setGasData(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to connect to backend')
        console.error(err)
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Poll every 2 seconds
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Add alert notification
  const addAlert = (message, type = 'info') => {
    const id = Date.now()
    setAlerts(prev => [...prev, { id, message, type }])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Gas Leakage Detection System
            </h1>
            <div className="text-sm text-gray-400">
              Real-time Monitoring • IoT Connected
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Alerts */}
        <Alerts alerts={alerts} />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Dashboard - 2 columns */}
          <div className="lg:col-span-2">
            <Dashboard 
              gasData={gasData} 
              loading={loading}
              onAlert={addAlert}
            />
          </div>

          {/* Subscribe Form - 1 column */}
          <div>
            <SubscribeForm onSubscribe={addAlert} />
          </div>
        </div>

        {/* Control Panel - Full Width */}
        <ControlPanel onCommand={addAlert} />

        {/* Subscriber List - Full Width */}
        <div className="mt-8">
          <SubscriberList onAlert={addAlert} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>IoT Gas Leakage Detection System © 2026</p>
          <p>Real-time monitoring powered by MQTT and Node.js</p>
        </div>
      </footer>
    </div>
  )
}
