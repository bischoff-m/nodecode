import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'

function AppContainer() {
  useEffect(() => {
    window.loading.removeLoading()
  })

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')
const root = container && ReactDOM.createRoot(container)
root?.render(<AppContainer />)


/**
 * My test function.
 * 
 * @param n - A string param
 * @param [o] - A optional string param
 * @param [d=DefaultValue] - A optional string param
 * @return A good string
 *
 * @example
 *
 *     __doc_test('hello')
 */
export function __doc_test(n: string, o: string , d: string): string {
  return '42'
}