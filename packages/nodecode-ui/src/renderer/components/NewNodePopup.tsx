/**
 * This component provides a searchable list of all available nodes. When an entry is
 * clicked, the corresponding node is added to the canvas. The `NewNodePopup` can be shown
 * and hidden by pressing the space bar. The library [Fuse.js](https://fusejs.io/) is used
 * for searching nodes.
 * 
 * @remarks
 * This component is still under development. It was the first approach and an easy/fast
 * way to add nodes to the canvas, which was also simple to implement. However, it will
 * not scale well for many nodes in its current state.
 * 
 * Once multiple packages are implemented, the popup should indicate which package a node
 * is defined in (like "SQL > SQL Query" and "SQL > Column Select") and include an icon.
 * Also, it should not be fixed to the canvas div but rather to the container div and
 * slide up/down from the bottom/top edge of the `NodeCanvas`. It would also be nice to
 * be able to select an entry using the arrow keys and `Enter`.
 * 
 * @module
 */

import { createStyles, Loader, Stack, TextInput } from '@mantine/core'
import type { MantineSize } from '@mantine/core'
import { IconSearch } from '@tabler/icons'
import Fuse from 'fuse.js'
import { useContext, useEffect, useRef, useState } from 'react'
import { NodePackageContext } from '@/components/NodePackageProvider'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { useDispatchTyped } from '@/redux/hooks'
import { addNode } from '@/redux/programSlice'
import { fixedTheme } from '@/styles/themeCanvas'
import { Node } from '@/types/NodePackage'
import { Vec2D } from '@/types/util'


//////////////////////////////////////////////////////////////////////////////////////////
// Global constants and variables
//////////////////////////////////////////////////////////////////////////////////////////

/** [Options](https://fusejs.io/api/options.html) needed for `fuse.js`. */
const fuseOptions = {
  keys: ['title'],
}

/** The Fuse object used to search for nodes. */
let fuse: Fuse<Node> | null = null

/** List of all available nodes in a format that fits `fuse.js`. */
let allNodes: Fuse.FuseResult<Node>[] = []


//////////////////////////////////////////////////////////////////////////////////////////
// Component
//////////////////////////////////////////////////////////////////////////////////////////

/** {@link https://mantine.dev/styles/create-styles/} */
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


/** @category Component */
export type NewNodePopupProps = {
  /** Where the popup should appear on the canvas. */
  screenPosition: Vec2D

  /** Function to hide the popup when done. */
  toggleOpen: () => void
}

/** @category Component */
export default function NewNodePopup(props: NewNodePopupProps): JSX.Element {
  const { classes } = useStyles()
  const dispatch = useDispatchTyped()
  const refInput = useRef<HTMLInputElement>(null)
  const nodePackage = useContext(NodePackageContext)

  /** Stores the nodes that are currently shown in the list as search results. */
  const [searchResults, setSearchResults] = useState<Fuse.FuseResult<Node>[] | null>(null)

  useEffect(() => {
    // Focus the text input once the popup is opened
    refInput.current?.focus()

    // Init the search library
    fuse = new Fuse(nodePackage.nodes, fuseOptions)
    // Transform the list of all nodes into a search index
    allNodes = nodePackage.nodes.map((node, idx) => ({
      item: node,
      refIndex: idx,
      score: 1,
      matches: [],
    }))

    // Initially show all nodes
    setSearchResults(allNodes)
  }, [])

  /** @returns The list part of the `NewNodePopup` that shows the current search result */
  function getContent(): JSX.Element {
    // Show a loading icon if its still loading
    if (!fuse || !searchResults || !refInput.current)
      return (
        <div className={classes.loadingContainer}>
          <Loader variant='dots' />
        </div>
      )

    // Show the results if a query is given, otherwise show all nodes
    let results: Fuse.FuseResult<Node>[] = []
    if (refInput.current.value.length > 0)
      results = searchResults
    else
      results = allNodes

    // Insert one row for every node that fits the search
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
                  node: {
                    type: result.item.id,
                    display: {
                      width: 200,
                      x: 200,
                      y: 200,
                    },
                    state: {},
                  }
                }))
              }}
            >
              {result.item.title}
            </div>
          ))}
      </Stack>
    )
  }

  // Wrap the rows in a scroll area and add a text input on top
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