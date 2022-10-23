/**
 * This button writes the current global program state in the
 * {@link "renderer/redux/programSlice" programSlice} to the current JSON program file.
 * The actual writing is done by the main process, so when clicked, the button will send
 * a request via the IPC. It also disables itself when clicked and gets enabled when
 * the program state changed.
 * 
 * @see {@link "renderer/components/Header" Header}
 * 
 * **Note**
 * 
 * > Currently the *Save* feature only supports a single file linked to a single program
 * > in state. In the future, there should be a file explorer to open and save files and
 * > the possibility to have multiple programs open. For this, the global program state in
 * > the `programSlice` has to be revised to support multiple programs.
 * 
 * @module
 */

import { Button } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useSelectorTyped } from '@/redux/hooks'

/** @category Component */
export default function SaveFileButton(): JSX.Element {
  const program = useSelectorTyped((state) => state.program)
  const [disabled, setDisabled] = useState<boolean>(false)

  useEffect(() => {
    setDisabled(false)
  }, [program])

  return (
    <Button
      disabled={disabled}
      color='primary'
      onClick={() => {
        window.ipc.send.saveProgram(program)
        setDisabled(true)
      }}
    >SAVE</Button>
  )
}