import { useState, useRef, useEffect } from 'react'
import { bufferToHex } from '../utils'
import ErrorMessage from './components/ErrorMessage'
import StatusMessage from './components/StatusMessage'

function App(): JSX.Element {
  const [error, setError] = useState({
    active: false,
    message: ''
  })
  const [polling, setPolling] = useState<boolean>(false)

  // Simulates polling (getting value from device every 1 second)
  useEffect(() => {
    if (!polling) return
    const interval = setInterval(async () => {
      if (connectedCharacteristic.current) {
        await connect()
      }
    }, 1_000)

    return () => clearInterval(interval)
  }, [polling])

  // state for showing the connection status / messages
  const [connectionStatus, setConnectionStatus] = useState<string>('')

  // Use these as "storage" so that we don't need to reconnect every time
  const connectedDevice = useRef<BluetoothDevice | undefined>(undefined)
  const connectedServer = useRef<BluetoothRemoteGATTServer | undefined>(undefined)
  const connectedService = useRef<BluetoothRemoteGATTService | undefined>(undefined)
  const connectedCharacteristic = useRef<BluetoothRemoteGATTCharacteristic | undefined>(undefined)

  async function connect(): Promise<void> {
    // Check if the current device has bluetooth
    const available = await navigator.bluetooth.getAvailability()
    if (!available) {
      setError({
        active: true,
        message: 'Bluetooth is not available on this device.'
      })
      return
    }

    /**
     * For a proprietary device, I believe this is the
     * correct syntax to connect to it.
     * services: ['device-specific-service-uuid']
     */

    try {
      setConnectionStatus('Requesting Bluetooth Device')
      if (!connectedDevice.current) {
        // Request a device
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
        // Connect to the device as a gatt server
        connectedServer.current = await connectedDevice.current?.gatt?.connect()
      }
      if (!connectedService.current) {
        setConnectionStatus(`Getting Heart Rate service`)
        // Get the heart rate service
        connectedService.current = await connectedServer?.current?.getPrimaryService('heart_rate')
      }

      if (!connectedCharacteristic.current) {
        setConnectionStatus('Reading Heart Rate Control Point')
        // Get the heart rate control point characteristic
        connectedCharacteristic.current = await connectedService?.current?.getCharacteristic(
          'heart_rate_control_point'
        )
      }

      // Read the value
      const value = await connectedCharacteristic?.current?.readValue()

      if (value!.byteLength >= 2) {
        console.log('Heart Rate Control Point: ', value!.getUint16(0))
      } else {
        setError({
          active: false,
          message: ''
        })
        console.log(bufferToHex(value!.buffer))
        // Convert the buffer to a hex string
        setConnectionStatus(`Value is ${bufferToHex(value!.buffer)}`)
      }
    } catch (err: any) {
      connectedDevice.current = undefined
      connectedServer.current = undefined
      connectedService.current = undefined
      connectedCharacteristic.current = undefined

      // If there's an erorr, set the error state
      setError({
        active: true,
        message: err.message
      })
    }
  }

  async function setHeartRate(): Promise<void> {
    try {
      // Generate a random number between 0 and 100
      const randInt = Math.floor(Math.random() * 100)
      const heartRateValue = randInt
      const buffer = new Uint8Array(1)
      buffer[0] = heartRateValue
      // Write the value to the characteristic
      await connectedCharacteristic?.current?.writeValue(buffer)
      // Read the new value
      await connect()
    } catch (err: any) {
      // If there's an erorr, set the error state
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
        <div className="absolute top-5 right-5">
          <button
            onClick={() => setPolling((prev) => !prev)}
            className={
              polling
                ? `p-2 rounded-xl border-2 text-white font-medium bg-blue-700`
                : `p-2 rounded-xl border-2 text-white font-medium hover:bg-blue-700`
            }
          >
            Polling
          </button>
        </div>
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
      {/* Connection Messages */}
      {connectionStatus !== '' && <StatusMessage message={connectionStatus} />}
      {/* Error Message */}
      {error.active && <ErrorMessage message={error.message} />}
    </div>
  )
}

export default App
