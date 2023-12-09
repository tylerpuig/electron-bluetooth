import { ipcRenderer } from 'electron'
import { useEffect } from 'react'

function App(): JSX.Element {
  async function connect() {
    // navigator.bluetooth.getAvailability().then((available) => {
    //   if (available) {
    //     console.log('This device supports Bluetooth!')
    //   } else {
    //     console.log('Doh! Bluetooth is not supported')
    //   }
    // })
    try {
      console.log('Requesting Bluetooth Device to get heart rate data...')
      navigator.bluetooth
        .requestDevice({
          filters: [
            {
              services: ['heart_rate']
            }
          ]
        })
        .then((device) => {
          console.log('Got device: ', device.name)
          console.log('id: ', device.id)
          return device.gatt.connect()
        })
        .then((server) => {
          console.log('Getting Heart Rate Service…')
          return server.getPrimaryService('heart_rate')
        })
        .then((service) => {
          console.log('Getting Heart Rate Control Point Characteristic…')
          return service.getCharacteristic('heart_rate_control_point')
        })
        .then((characteristic) => {
          console.log('Reading Heart Rate Control Point…')
          return characteristic.readValue()
        })
        .then((value) => {
          value = value.buffer ? value : new DataView(value)
          console.log('Heart Rate Control Point: ', value.getUint16())
        })
        .catch((exception) => {
          console.log(exception)
        })
    } catch (error) {
      console.error(error)
    }
  }

  // window.electronAPI.bluetoothPairingRequest((event, details) => {
  //   console.log(event, details)
  //   const response = {}

  //   switch (details.pairingKind) {
  //     case 'confirm': {
  //       response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
  //       break
  //     }
  //     case 'confirmPin': {
  //       response.confirmed = window.confirm(
  //         `Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`
  //       )
  //       break
  //     }
  //     case 'providePin': {
  //       const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
  //       if (pin) {
  //         response.pin = pin
  //         response.confirmed = true
  //       } else {
  //         response.confirmed = false
  //       }
  //     }
  //   }

  //   window.electronAPI.bluetoothPairingResponse(response)
  // })

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
