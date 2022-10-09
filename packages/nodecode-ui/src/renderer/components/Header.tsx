import {
  Header as MantineHeader,
  Button,
  Group,
} from '@mantine/core'
import SaveFileButton from '@/components/SaveFileButton'
import backend from '@/util/backendInterface'

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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .invoke('run', 'hallo hier mein programm', () => { })
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