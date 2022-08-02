import { createStyles } from '@mantine/core'
import {
  Header as MantineHeader,
  Button,
  Group,
} from '@mantine/core'
import backend from '@/util/backendInterface'
import SaveFileButton from '@/components/SaveFileButton'

const useStyles = createStyles((theme) => ({

}))

export default function Header() {
  const { classes } = useStyles()

  return (
    <MantineHeader height={60} p='sm'>
      <Group position='right'>
        <SaveFileButton />
        <Button
          color="primary"
          // TODO: Revise backend access method and improve the types (omit callback parameter)
          // onClick={() => backend.invoke('run', 'hallo hier mein programm')
          onClick={() => backend
            .invoke('run', 'hallo hier mein programm', (data: any) => { })
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