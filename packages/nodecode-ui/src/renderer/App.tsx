/**
 * The root app component that wraps all of the content. This is directly referenced by
 * {@link "renderer/main"}, the entry point for the renderer process.
 * 
 * @module
 */

import { MantineProvider, AppShell } from '@mantine/core'
import { Provider as ReduxProvider } from 'react-redux'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import NodeCanvas from '@/components/NodeCanvas'
import '@/styles/global.scss'
import NodePackageProvider from '@/components/NodePackageProvider'
import store from '@/redux/store'
import theme from '@/styles/themeApp'

/** @category Component */
export default function App(): JSX.Element {
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