import { createStyles, Loader, Stack, TextInput } from '@mantine/core'
import type { MantineSize } from '@mantine/core'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { fixedTheme } from '@/styles/themeCanvas'
import { IconSearch } from '@tabler/icons'
import { Vec2D } from '@/types/util'
import { useEffect, useRef, useState } from 'react'
import { onNodesLoaded } from '@/util/nodeFactory'
import { NodePackage } from '@/types/NodePackage'

const useStyles = createStyles((theme) => ({
  container: {
    position: 'absolute',
    width: fixedTheme.nodeWidth,
    zIndex: 2000,
    backgroundColor: theme.other.nodeBackgroundColor,
    borderRadius: theme.radius[theme.defaultRadius as MantineSize],
    padding: fixedTheme.nodePadding,
    boxShadow: theme.other.nodeContainerShadow,
    left: 400,
    top: 300,
  },
  stack: {
    padding: 5,
  },
  loadingContainer: {
    display: 'flex',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

type NewNodeListProps = {
  screenPosition: Vec2D
}

export default function NewNodeList(props: NewNodeListProps) {
  const { classes } = useStyles()
  const refInput = useRef<HTMLInputElement>(null)
  let [searchResults, setSearchResults] = useState<NodePackage | null>(null)

  useEffect(() => {
    refInput.current?.focus()
    onNodesLoaded((nodes) => setSearchResults(nodes))
  }, [])

  return (
    <div
      className={classes.container}
      style={{
        left: props.screenPosition.x,
        top: props.screenPosition.y,
      }}
    >
      <TextInput
        ref={refInput}
        icon={<IconSearch size={fixedTheme.iconSize} />}
        type='search'
      />
      <MaxHeightScrollArea maxHeight={300}>
        {
          searchResults
            ?
            <Stack className={classes.stack} spacing={3}>
              {searchResults.nodes.map((node) => (
                <div key={node.id}>{node.title}</div>
              ))}
            </Stack>
            :
            <div className={classes.loadingContainer}>
              <Loader variant='dots' />
            </div>
        }
      </MaxHeightScrollArea>
    </div>
  )
}