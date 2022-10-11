/**
 * This component is passed to the header prop of the
 * [AppShell](https://mantine.dev/core/app-shell/) mantine component that wraps the whole
 * app.
 * @see {@link "renderer/App" App}
 * 
 * **Note**
 * 
 * > Currently, this header contains buttons to save and run the program and to send a
 * > `quit` command to the backend. These are currently only included here for testing
 * > purposes and should still be placed in a convenient location in the UI in the future.
 * > The header should then replace the Windows program header, have buttons to minimize,
 * > maximize and close on the right and contain tabs for the open node programs.
 * 
 * @module
 */

import {
  Header as MantineHeader,
  Button,
  Group,
} from '@mantine/core'
import SaveFileButton from '@/components/SaveFileButton'
import backend from '@/util/backendInterface'

/**
 * @category Component
 */
export default function Header() {
  return (
    <MantineHeader height={60} p='sm'>
      <Group position='right'>
        <SaveFileButton />
        <Button
          color="primary"
          // TODO: Revise backend access method and improve the types (omit callback parameter)
          // onClick={() => backend.invoke('run', 'hallo hier mein programm')
          onClick={() => backend
            .invoke('run', 'hallo hier mein programm', () => undefined)
            .then((data) => console.log('antwort ist zurück: ', data))
          }
        >RUN</Button>
        <Button
          color="primary"
          onClick={() => backend.send('quit')}
        >QUIT</Button>
      </Group>
    </MantineHeader>
  )
}