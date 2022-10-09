import { Button } from '@mantine/core'
import { useSelectorTyped } from '@/redux/hooks'

export default function SaveFileButton() {
  const program = useSelectorTyped((state) => state.program)

  return (
    <Button
      color="primary"
      onClick={() => window.ipc.send.saveProgram(program)}
    >SAVE</Button>
  )
}