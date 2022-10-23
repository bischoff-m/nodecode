/**
 * A `Node` consists of a header and a vertical stack of fields. The title string for the
 * header and the field components are given via the props. A node can also be
 * highlighted.
 * 
 * Everything is wrapped by a `<Draggable></Draggable>` element from the
 * [react-draggable](https://www.npmjs.com/package/react-draggable) library, so the node
 * can be moved by dragging the header.
 * 
 * TODO: Update of nodePos, lastNodePos, global state and redux state
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
  /** Default X-Coordinate of the node on the canvas. */
  x: number
  /** Default Y-Coordinate of the node on the canvas. */
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

  /** Position of the node before being dragged. */
  let lastNodePos: Vec2D = { x: props.x, y: props.y }
  /** Position of the node while being dragged. */
  let nodePos: Vec2D = { x: props.x, y: props.y }
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
   * Is triggered when the user starts to drag the node and updates internal variables
   * that keep track of the position of the node.
   * @param event - The event that was triggered when one of the handles was dragged.
   * @param data - Event data that (among other things) stores the position of the handle.
   */
  function onStart(event: DraggableEvent, data: DraggableData) {
    lastNodePos = { x: data.x, y: data.y }
    nodePos = { x: data.x, y: data.y }
  }

  /**
   * Is triggered repeatedly while the user is dragging the node. This updates the
   * position of the sockets that belong to this node in the
   * {@link "renderer/redux/socketsSlice".socketPositions} global non-redux state. This
   * is needed to make the connections between this node and other nodes stick while
   * dragging.
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
   * Is triggered when the user stops dragging the node. This updates the position of the
   * sockets that belong the this node in the `socketsSlice` global redux state.
   * Also, the position of the node is updated in the `programSlice`.
   * @param event - The event that was triggered when one of the handles was dragged.
   * @param data - Event data that (among other things) stores the position of the handle.
   */
  function onStop(event: DraggableEvent, data: DraggableData) {
    if (lastNodePos.x === data.x && lastNodePos.y === data.y)
      return

    dispatch(moveNodeSocketsStop(props.nodeKey))

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
        {/* Handle for the <Draggable></Draggable> element */}
        <header
          className={classes.header}
          onMouseOver={() => { isHovering = true; setHighlight() }}
          onMouseOut={() => { isHovering = false; setHighlight() }}
        >
          {props.title}
        </header>

        {/* Field components in a vertical stack */}
        <Stack className={classes.content} justify="flex-start" spacing={fixedTheme.nodeFieldSpacing}>
          {props.children}
        </Stack>
      </div>
    </Draggable>
  )
}