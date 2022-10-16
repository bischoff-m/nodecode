/**
 * The entry point for the renderer process.
 * @module
 */

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'

function AppContainer(): JSX.Element {
  useEffect(() => {
    window.loading.removeLoading()
  })

  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}

const container = document.getElementById('root')
const root = container && createRoot(container)
root?.render(<AppContainer />)

// TODO: remove test functions
/**
 * My test function.
 * 
 * @param n - A string param
 * @param [o] - A optional string param
 * @param [d=DefaultValue] - A optional string param
 * @returns A good string
 *
 * @example
 *
 *     doc_test_exported('hello')
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function doc_test_exported(n: string, o: string, d: string): string {
  return '42'
}

/**
 * My test function.
 * 
 * @param n - A string param
 * @returns A good string
 *
 * @example
 *
 *     __doc_test('hello')
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function __doc_test(n: string, o: string, d: string): string {
  return '42'
}