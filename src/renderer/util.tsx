

type ToBackendEvent = {
  name: string,
  args?: any[],
  timeout?: number,
}

// register listener for incoming events from backend if not already registered
// TODO: provide function to register for specific backend events
if (window.api.listenerCount('fromBackend') === 0) {
  window.api.on('fromBackend', (event, data) => {
    console.log('sent from backend to renderer:', data)
  })
}

// TODO: check if backend is connected before sending by implementing an event from main to renderer on disconnect
export function sendBackend(event: ToBackendEvent): void {
  window.api.send('toBackend', event)
}

export function invokeBackend(event: ToBackendEvent): Promise<any> {
  return window.api.invoke('toBackend', event)
}



export function removeColorTags(shades: {
  '50': string,
  '100': string,
  '200': string,
  '300': string,
  '400': string,
  '500': string,
  '600': string,
  '700': string,
  '800': string,
  '900': string
}): [string, string, string, string, string, string, string, string, string, string] {
  return [
    shades['50'],
    shades['100'],
    shades['200'],
    shades['300'],
    shades['400'],
    shades['500'],
    shades['600'],
    shades['700'],
    shades['800'],
    shades['900']
  ]
}