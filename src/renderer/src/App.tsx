import { ipcRenderer } from 'electron'
import { useEffect } from 'react'

function App(): JSX.Element {
  async function connect() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      })
      console.log(device)

      // Further code to handle the connected device
    } catch (error) {
      console.error('Bluetooth device selection was cancelled', error)
      // Handle the error or cancellation here
    }
  }

  window.electronAPI.bluetoothPairingRequest((event, details) => {
    console.log(event, details)
    const response = {}

    switch (details.pairingKind) {
      case 'confirm': {
        response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
        break
      }
      case 'confirmPin': {
        response.confirmed = window.confirm(
          `Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`
        )
        break
      }
      case 'providePin': {
        const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
        if (pin) {
          response.pin = pin
          response.confirmed = true
        } else {
          response.confirmed = false
        }
      }
    }

    window.electronAPI.bluetoothPairingResponse(response)
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <h1 className="mt-4 text-2xl text-white font-medium p-4 border-2 border-white rounded-xl">
          Electron Bluetooth
        </h1>
      </div>
      <div className="flex justify-center">
        <button
          onClick={connect}
          className="p-4 rounded-xl border-2 text-white font-medium hover:bg-blue-700"
        >
          Connect
        </button>
      </div>
    </div>
  )
}

export default App
