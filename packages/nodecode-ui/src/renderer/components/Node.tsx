/**
 * This component consists of a `<Draggable></Draggable>` component that wraps everything.
 * 
 * - Update of nodePos, lastNodePos, global state and redux state
 * 
 * @module
 */

import { createStyles, MantineSize, Stack, useMantineTheme } from '@mantine/core'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Draggable from 'react-draggable'
import type { DraggableData, DraggableEvent } from 'react-draggable'
import { getCanvasZoom, addZoomChangedListener } from '@/components/NodeCanvas'
import { getSelectedNode, addNodeSelectedListener, setSelectedNode } from '@/components/NodeProvider'
import { useDispatchTyped } from '@/redux/hooks'
import { moveNode } from '@/redux/programSlice'
import { moveNodeSockets, moveNodeSocketsStop } from '@/redux/socketsSlice'
import { fixedTheme } from '@/styles/themeCanvas'
import { Vec2D } from '@/types/util'


/** {@link https://mantine.dev/styles/create-styles/} */
const useStyles = createStyles((theme) => ({
  card: {
    position: 'absolute',
    width: fixedTheme.nodeWidth,
    boxShadow: theme.other.nodeContainerShadow,
    backgroundColor: theme.other.nodeBackgroundColor,
    borderRadius: theme.radius[theme.defaultRadius as MantineSize],
  },
  header: {
    fontSize: theme.fontSizes.xl,
    color: theme.other.textColor,
    padding: 8,
    paddingLeft: fixedTheme.nodePadding + 4,
    backgroundColor: theme.other.nodeHeaderBackgroundColor,
    borderTopLeftRadius: theme.radius[theme.defaultRadius as MantineSize],
    borderTopRightRadius: theme.radius[theme.defaultRadius as MantineSize],
  },
  content: {
    padding: fixedTheme.nodePadding,
  },
  highlight: {
    outline: theme.other.nodeHoverOutline,
  },
}))

/** @category Component */
export type NodeProps = {
  /** The field components of this node. */
  children?: ReactNode
  /** The unique identifier to refer to this node in the global program state. */
  nodeKey: string
  /** Name that is displayed in the header of the node. */
  title: string
  /** X-Coordinate of the node on the canvas. */
  x: number
  /** Y-Coordinate of the node on the canvas. */
  y: number
}

/** @category Component */
export default function Node(props: NodeProps): JSX.Element {
  // Redux
  const dispatch = useDispatchTyped()

  // Styles
  const { classes } = useStyles()
  const theme = useMantineTheme()

  // Refs
  const nodeRef = useRef<HTMLDivElement>(null)

  // State and variables
  /** Variable is mirrored from `NodeCanvas` to enable state updates. */
  const [canvasZoom, setCanvasZoom] = useState<number>(getCanvasZoom())

  /** Position of node before being dragged. */
  let lastNodePos: Vec2D | null = null
  /** Position of node while being dragged. */
  let nodePos: Vec2D | null = null
  /** Whether the cursor hovers over the title bar of the node. */
  let isHovering = false

  // Update this component when the canvas zoom changed or a new node is selected
  addZoomChangedListener((newZoom: number) => setCanvasZoom(newZoom))
  addNodeSelectedListener(() => setHighlight())

  ////////////////////////////////////////////////////////////////////////////////////////
  // Functions
  ////////////////////////////////////////////////////////////////////////////////////////

  /** Reads the global state which node is selected and sets the outline of this node. */
  function setHighlight() {
    if (!nodeRef.current)
      return
    if (props.nodeKey === getSelectedNode())
      nodeRef.current.style.outline = theme.other.nodeActiveOutline
    else if (isHovering)
      nodeRef.current.style.outline = theme.other.nodeHoverOutline
    else
      nodeRef.current.style.outline = 'none'
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  // Event Listeners
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * 
   * @param event - The event that was triggered when one of the handles was dragged.
   * @param data - Event data that (among other things) stores the position of the handle.
   */
  function onStart(event: DraggableEvent, data: DraggableData) {
    lastNodePos = { x: data.x, y: data.y }
    nodePos = { x: data.x, y: data.y }
  }

  /**
   * 
   * @param event - The event that was triggered when one of the handles was dragged.
   * @param data - Event data that (among other things) stores the position of the handle.
   */
  function onDrag(event: DraggableEvent, data: DraggableData) {
    if (!nodePos)
      return
    moveNodeSockets(props.nodeKey, {
      x: data.x - nodePos.x,
      y: data.y - nodePos.y
    })
    nodePos = { x: data.x, y: data.y }
  }

  /**
   * 
   * @param event - The event that was triggered when one of the handles was dragged.
   * @param data - Event data that (among other things) stores the position of the handle.
   */
  function onStop(event: DraggableEvent, data: DraggableData) {
    if (lastNodePos && lastNodePos.x === data.x && lastNodePos.y === data.y)
      return

    dispatch(moveNodeSocketsStop(props.nodeKey))
    if (lastNodePos)
      dispatch(moveNode({
        key: props.nodeKey,
        delta: {
          x: data.x - lastNodePos.x,
          y: data.y - lastNodePos.y
        }
      }))
    nodePos = { x: data.x, y: data.y }
    lastNodePos = { x: data.x, y: data.y }
  }


  ////////////////////////////////////////////////////////////////////////////////////////
  // Return
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Draggable
      handle={'.' + classes.header}
      defaultPosition={{ x: props.x, y: props.y }}
      grid={[
        fixedTheme.gridSize * canvasZoom,
        fixedTheme.gridSize * canvasZoom,
      ]}
      nodeRef={nodeRef}
      onStart={onStart}
      onDrag={onDrag}
      onStop={onStop}
      scale={canvasZoom}
    >
      <div
        className={classes.card}
        ref={nodeRef}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedNode(props.nodeKey)
        }}
      >
        <header
          className={classes.header}
          onMouseOver={() => { isHovering = true; setHighlight() }}
          onMouseOut={() => { isHovering = false; setHighlight() }}
        >
          {props.title}
        </header>
        <Stack className={classes.content} justify="flex-start" spacing={fixedTheme.nodeFieldSpacing}>
          {props.children}
        </Stack>
      </div>
    </Draggable>
  )
}