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
const root = ReactDOM.createRoot(container!)
root.render(<AppContainer />)