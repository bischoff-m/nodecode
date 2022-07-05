import NodeCanvas from '@/components/NodeCanvas'
import theme from '@/styles/themeApp'
import { Provider } from 'react-redux'
import store from '@/redux/store'
import { MantineProvider, AppShell } from '@mantine/core'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import '@/styles/global.scss'

export default function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Provider store={store}>
        <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
          <AppShell padding={0} navbar={<Navbar />} header={<Header />}>
            <NodeCanvas />
          </AppShell>
        </MantineProvider>
      </Provider>
    </div>
  )
}