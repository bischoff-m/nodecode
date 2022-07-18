import { createStyles, Stack } from '@mantine/core'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { fixedTheme } from '@/styles/themeCanvas'

const useStyles = createStyles((theme) => ({
  container: {
    position: 'relative',
    width: fixedTheme.nodeWidth,
    zIndex: 2000,
    backgroundColor: theme.other.nodeBackgroundColor,
  },
}))

export default function NewNodeList() {
  const { classes } = useStyles()

  return (
    <MaxHeightScrollArea
      className={classes.container}
      maxHeight={300}
    >
      <Stack>
        <div>Test</div>
      </Stack>
    </MaxHeightScrollArea>
  )
}