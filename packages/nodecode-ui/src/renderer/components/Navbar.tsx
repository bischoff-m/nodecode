/**
 * This component is passed to the navbar prop of the
 * [AppShell](https://mantine.dev/core/app-shell/) mantine component that wraps the whole
 * app.
 * @see {@link "renderer/App" App}
 * 
 * **Note**
 * 
 * > Currently, this navbar is empty. In the future, it should contain icon buttons that
 * > provide access to the application's main functions, such as a file explorer, output
 * > window, node browser, package browser, program configuration, or other tools.
 * 
 * @module
 */

import { Navbar as MantineNavbar } from '@mantine/core'

/** @category Component */
export default function Navbar(): JSX.Element {
  return (
    <MantineNavbar width={{ base: 60 }}>
    </MantineNavbar>
  )
}