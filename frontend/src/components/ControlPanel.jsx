import { useState } from 'react'
import { sendControl } from '../services/api'

export default function ControlPanel({ onCommand }) {
  const [loading, setLoading] = useState(false)
  const [lastCommand, setLastCommand] = useState(null)

  const handleCommand = async (command, label) => {
    try {
      setLoading(true)
      const response = await sendControl(command)
      
      if (response.success) {
        setLastCommand(label)
        onCommand(`✓ ${label} executed`, 'success')
      } else {
        onCommand(`✗ Failed: ${label}`, 'danger')
      }
    } catch (error) {
      console.error('Command error:', error)
      onCommand(`✗ Error: ${error.message}`, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const systemCommands = [
    { cmd: 'ON', label: 'System ON', icon: '🟢', color: 'green' },
    { cmd: 'OFF', label: 'System OFF', icon: '🔴', color: 'red' },
    { cmd: 'TEST', label: 'Test Alert', icon: '🧪', color: 'blue' }
  ]

  const relayCommands = [
    { cmd: 'RELAY_ON', label: 'Fan ON (Relay Open)', icon: '💨', color: 'cyan' },
    { cmd: 'RELAY_OFF', label: 'Fan OFF (Relay Close)', icon: '🔒', color: 'orange' }
  ]

  const servoCommands = [
    { cmd: 'SERVO_0', label: 'Servo 0° (Closed)', icon: '📍', color: 'purple' },
    { cmd: 'SERVO_90', label: 'Servo 90° (Open)', icon: '📍', color: 'indigo' },
    { cmd: 'SERVO_180', label: 'Servo 180° (Max)', icon: '📍', color: 'violet' }
  ]

  const ledCommands = [
    { cmd: 'LED_GREEN', label: 'Green LED ON', icon: '🟢', color: 'green' },
    { cmd: 'LED_RED', label: 'Red LED ON', icon: '🔴', color: 'red' },
    { cmd: 'LED_OFF', label: 'All LEDs OFF', icon: '⚫', color: 'gray' }
  ]

  const buzzerCommands = [
    { cmd: 'BUZZER_ON', label: 'Buzzer ON', icon: '🔔', color: 'yellow' },
    { cmd: 'BUZZER_OFF', label: 'Buzzer OFF', icon: '🔇', color: 'gray' }
  ]

  const integratedCommands = [
    { cmd: 'SERVO_WITH_FAN', label: 'Servo + Fan (Emergency)', icon: '🚨', color: 'red' },
    { cmd: 'ALERT_MODE', label: 'Full Alert Mode', icon: '⚠️', color: 'orange' },
    { cmd: 'NORMAL_MODE', label: 'Normal Mode', icon: '✅', color: 'green' }
  ]

  const renderCommandButton = (cmd, label, icon) => (
    <button
      key={cmd}
      onClick={() => handleCommand(cmd, label)}
      disabled={loading}
      className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 
        ${lastCommand === label
          ? 'bg-blue-600 border-blue-500 ring-2 ring-blue-400'
          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
        } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
      title={`Send: ${cmd}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-bold">{label}</div>
    </button>
  )

  return (
    <div className="space-y-6">
      {/* System Control */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">🎮 System Control</h2>
        <div className="grid grid-cols-3 gap-4">
          {systemCommands.map(cmd =>
            renderCommandButton(cmd.cmd, cmd.label, cmd.icon)
          )}
        </div>
      </div>

      {/* Relay Control */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <h3 className="text-xl font-bold text-white mb-4">💨 Fan Control (Relay GPIO 33)</h3>
        <div className="grid grid-cols-2 gap-4">
          {relayCommands.map(cmd =>
            renderCommandButton(cmd.cmd, cmd.label, cmd.icon)
          )}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          💡 Relay OFF = Gas valve CLOSED (Emergency/Alert)<br/>
          Relay ON = Gas valve OPEN (Normal operation)
        </p>
      </div>

      {/* Servo Control */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <h3 className="text-xl font-bold text-white mb-4">🎛️ Servo Control (GPIO 14 PWM)</h3>
        <div className="grid grid-cols-3 gap-4">
          {servoCommands.map(cmd =>
            renderCommandButton(cmd.cmd, cmd.label, cmd.icon)
          )}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Servo controls vent position: 0° (closed) → 90° (open) → 180° (max ventilation)
        </p>
      </div>

      {/* LED Control */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <h3 className="text-xl font-bold text-white mb-4">💡 LED Status Indicators (GPIO 25, 26)</h3>
        <div className="grid grid-cols-3 gap-4">
          {ledCommands.map(cmd =>
            renderCommandButton(cmd.cmd, cmd.label, cmd.icon)
          )}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Green = Normal status | Red = Alert mode
        </p>
      </div>

      {/* Buzzer Control */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <h3 className="text-xl font-bold text-white mb-4">🔔 Buzzer Alarm (GPIO 27)</h3>
        <div className="grid grid-cols-2 gap-4">
          {buzzerCommands.map(cmd =>
            renderCommandButton(cmd.cmd, cmd.label, cmd.icon)
          )}
        </div>
      </div>

      {/* Integrated Scenarios */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <h3 className="text-xl font-bold text-white mb-4">🔗 Integrated Scenarios</h3>
        <div className="grid grid-cols-3 gap-4">
          {integratedCommands.map(cmd =>
            renderCommandButton(cmd.cmd, cmd.label, cmd.icon)
          )}
        </div>
        <div className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-blue-200 text-sm">
          <p><strong>How it works:</strong></p>
          <ul className="mt-2 space-y-1">
            <li>• All commands are published to MQTT topic: LPG/system/control</li>
            <li>• ESP32 receives commands and executes immediately</li>
            <li>• Responses published back to dashboard</li>
            <li>• Test each component individually first, then use integrated scenarios</li>
          </ul>
        </div>
      </div>

      {/* Status Info */}
      {lastCommand && (
        <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-blue-200 text-sm">
          <strong>Last Command:</strong> {lastCommand} (sent at {new Date().toLocaleTimeString()})
        </div>
      )}
    </div>
  )
}
