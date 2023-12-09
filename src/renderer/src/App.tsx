import { useState, useRef } from 'react'
import { bufferToHex } from '../utils'
import ErrorMessage from './components/ErrorMessage'
import StatusMessage from './components/StatusMessage'

function App(): JSX.Element {
  const [error, setError] = useState({
    active: false,
    message: ''
  })

  const [connectionStatus, setConnectionStatus] = useState<string>('')

  const connectedDevice = useRef<BluetoothDevice | undefined>(undefined)
  const connectedServer = useRef<BluetoothRemoteGATTServer | undefined>(undefined)
  const connectedService = useRef<BluetoothRemoteGATTService | undefined>(undefined)
  const connectedCharacteristic = useRef<BluetoothRemoteGATTCharacteristic | undefined>(undefined)

  async function connect(): Promise<void> {
    const available = await navigator.bluetooth.getAvailability()
    if (!available) {
      setError({
        active: true,
        message: 'Bluetooth is not available on this device.'
      })
      return
    }

    try {
      setConnectionStatus('Requesting Bluetooth Device')
      if (!connectedDevice.current) {
        connectedDevice.current = await navigator.bluetooth.requestDevice({
          filters: [
            {
              services: ['heart_rate']
            }
          ]
        })
        setConnectionStatus(`Found device ${connectedDevice.current.name}`)
      }
      if (!connectedServer.current) {
        connectedServer.current = await connectedDevice.current?.gatt?.connect()
      }
      if (!connectedService.current) {
        setConnectionStatus(`Getting Heart Rate service`)
        connectedService.current = await connectedServer?.current?.getPrimaryService('heart_rate')
      }

      if (!connectedCharacteristic.current) {
        setConnectionStatus('Reading Heart Rate Control Point')
        connectedCharacteristic.current = await connectedService?.current?.getCharacteristic(
          'heart_rate_control_point'
        )
      }

      const value = await connectedCharacteristic?.current?.readValue()

      if (value!.byteLength >= 2) {
        console.log('Heart Rate Control Point: ', value!.getUint16(0))
      } else {
        setError({
          active: false,
          message: ''
        })
        console.log(bufferToHex(value!.buffer))
        setConnectionStatus(`Value is ${bufferToHex(value!.buffer)}`)
      }
    } catch (err: any) {
      setError({
        active: true,
        message: err.message
      })
    }
  }

  async function setHeartRate(): Promise<void> {
    try {
      if (!connectedDevice.current) {
        setError({
          active: true,
          message: 'Please connect to a device'
        })
      }
      const randInt = Math.floor(Math.random() * 100)
      const heartRateValue = randInt
      const buffer = new Uint8Array(1)
      buffer[0] = heartRateValue

      await connectedCharacteristic?.current?.writeValue(buffer)
      await connect()
    } catch (err: any) {
      setError({
        active: true,
        message: err.message
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <h1 className="mt-4 text-2xl text-white font-medium p-4 border-2 border-white rounded-xl">
          Electron Bluetooth
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-4 px-4">
        <button
          onClick={connect}
          className="p-4 rounded-xl border-2 text-white font-medium hover:bg-blue-700"
        >
          Connect
        </button>

        <button
          onClick={setHeartRate}
          className="p-4 rounded-xl border-2 text-white font-medium hover:bg-blue-700"
        >
          Set Heart Rate
        </button>
      </div>
      {connectionStatus !== '' && <StatusMessage message={connectionStatus} />}
      {error.active && <ErrorMessage message={error.message} />}
    </div>
  )
}

export default App
