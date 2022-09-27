import NodeCanvas from '@/components/NodeCanvas'
import theme from '@/styles/themeApp'
import { Provider as ReduxProvider } from 'react-redux'
import store from '@/redux/store'
import { MantineProvider, AppShell } from '@mantine/core'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import '@/styles/global.scss'
import NodePackageProvider from '@/components/NodePackageProvider'

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