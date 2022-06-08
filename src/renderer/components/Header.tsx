import { createStyles } from '@mantine/core';
import {
  Header as MantineHeader,
  Button,
  Group,
} from '@mantine/core';
import { sendBackend, invokeBackend } from '@/util';

const useStyles = createStyles((theme) => ({

}));

export default function Header() {
  const { classes } = useStyles();

  return (
    <MantineHeader height={60} p='sm'>
      <Group position='right'>
        <Button
          color="primary"
          onClick={() => invokeBackend('run', 'hallo hier mein programm')
            .then((data) => console.log('antwort ist zurück: ', data))
          }
        >RUN</Button>
        <Button
          color="primary"
          onClick={() => sendBackend('quit')}
        >QUIT</Button>
      </Group>
    </MantineHeader>
  )
}