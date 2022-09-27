import { createStyles } from '@mantine/core'
import { Navbar as MantineNavbar } from '@mantine/core'

const useStyles = createStyles((theme) => ({

}))

export default function Navbar() {
  const { classes } = useStyles()

  return (
    <MantineNavbar width={{ base: 60 }}>
    </MantineNavbar>
  )
}