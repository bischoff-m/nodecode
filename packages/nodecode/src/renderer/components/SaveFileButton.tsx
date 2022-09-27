import { useSelectorTyped } from '@/redux/hooks'
import { Button, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({

}))

export default function SaveFileButton() {
  const { classes } = useStyles()
  const program = useSelectorTyped((state) => state.program)

  return (
    <Button
      color="primary"
      onClick={() => window.ipc.send.saveProgram(program)}
    >SAVE</Button>
  )
}