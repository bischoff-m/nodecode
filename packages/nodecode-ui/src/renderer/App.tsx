import { MantineProvider, AppShell } from '@mantine/core'
import { Provider as ReduxProvider } from 'react-redux'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import NodeCanvas from '@/components/NodeCanvas'
import '@/styles/global.scss'
import NodePackageProvider from '@/components/NodePackageProvider'
import store from '@/redux/store'
import theme from '@/styles/themeApp'

export default function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <ReduxProvider store={store}>
        <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
          <AppShell padding={0} navbar={<Navbar />} header={<Header />}>
            <NodePackageProvider>
              <NodeCanvas />
            </NodePackageProvider>
          </AppShell>
        </MantineProvider>
      </ReduxProvider>
    </div>
  )
}