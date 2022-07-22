import { createStyles, Loader, Stack, TextInput } from '@mantine/core'
import type { MantineSize } from '@mantine/core'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { fixedTheme } from '@/styles/themeCanvas'
import { IconSearch } from '@tabler/icons'
import { Vec2D } from '@/types/util'
import { useEffect, useRef, useState } from 'react'
import { onNodesLoaded } from '@/util/nodeFactory'
import { Node } from '@/types/NodePackage'
import Fuse from 'fuse.js'
import { useDispatchTyped } from '@/redux/hooks'
import { addNode } from '@/redux/programSlice'

// TODO: indexActive as state sets which list entry is highlighted
// TODO: add node to canvas when clicked
// TODO: move popup to desired position
// TODO: implement multiple node packages

let fuse: Fuse<Node> | null = null
let allNodes: Fuse.FuseResult<Node>[] = []

const fuseOptions = {
  keys: ['title'],
}

const useStyles = createStyles((theme) => ({
  container: {
    position: 'absolute',
    width: fixedTheme.nodeWidth,
    zIndex: 2000,
    backgroundColor: '#25262b', // TODO: use in (app-)theme to set color of all dropdowns
    borderRadius: theme.radius[theme.defaultRadius as MantineSize],
    padding: fixedTheme.nodePadding,
    boxShadow: theme.other.nodeContainerShadow,
    left: 400,
    top: 300,
  },
  stack: {
    paddingTop: fixedTheme.nodePadding,
  },
  loadingContainer: {
    display: 'flex',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackItem: {
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.fontSizes.md,
    borderRadius: theme.radius.sm,
    paddingLeft: 8,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
    },
  },
}))

type NewNodePopupProps = {
  screenPosition: Vec2D
  toggleOpen: () => void
}

export default function NewNodePopup(props: NewNodePopupProps) {
  const { classes } = useStyles()
  const refInput = useRef<HTMLInputElement>(null)
  let [searchResults, setSearchResults] = useState<Fuse.FuseResult<Node>[] | null>(null)
  const dispatch = useDispatchTyped()

  useEffect(() => {
    refInput.current?.focus()
    onNodesLoaded((nodePackage) => {
      fuse = new Fuse(nodePackage.nodes, fuseOptions)
      allNodes = nodePackage.nodes.map((node, idx) => ({
        item: node,
        refIndex: idx,
        score: 1,
        matches: [],
      }))
      setSearchResults(allNodes)
    })
  }, [])

  function getContent() {
    if (!fuse || !searchResults || !refInput.current)
      return (
        <div className={classes.loadingContainer}>
          <Loader variant='dots' />
        </div>
      )

    let results: Fuse.FuseResult<Node>[] = []
    if (refInput.current.value.length > 0)
      results = searchResults
    else
      results = allNodes

    return (
      <Stack className={classes.stack} spacing={0}>
        {results
          .map((result) => (
            <div
              key={result.item.id}
              className={classes.stackItem}
              onClick={() => {
                props.toggleOpen()
                dispatch(addNode({
                  type: result.item.id,
                  display: {
                    width: 200,
                    x: 200,
                    y: 200,
                  },
                  state: {},
                }))
              }}
            >
              {result.item.title}
            </div>
          ))}
      </Stack>
    )
  }

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
        wrapperProps={{ spellCheck: false }}
        type='search'
        onChange={() => {
          if (fuse && refInput.current)
            setSearchResults(fuse.search(refInput.current.value))
        }}
      />
      <MaxHeightScrollArea maxHeight={200}>
        {getContent()}
      </MaxHeightScrollArea>
    </div>
  )
}