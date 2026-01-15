export default function Alerts({ alerts }) {
  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-900 border-red-700 text-red-200'
      case 'success':
        return 'bg-green-900 border-green-700 text-green-200'
      case 'warning':
        return 'bg-yellow-900 border-yellow-700 text-yellow-200'
      default:
        return 'bg-blue-900 border-blue-700 text-blue-200'
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="fixed top-20 right-6 space-y-3 z-50 max-w-md">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border animate-in fade-in slide-in-from-top ${getAlertStyles(alert.type)}`}
        >
          {alert.message}
        </div>
      ))}
    </div>
  )
}
