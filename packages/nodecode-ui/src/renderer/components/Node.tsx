import { createStyles, MantineSize, Stack, useMantineTheme } from '@mantine/core'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Draggable from 'react-draggable'
import type { DraggableData, DraggableEvent } from 'react-draggable'
import { getCanvasZoom, onZoomChanged } from '@/components/NodeCanvas'
import { getSelectedNode, onNodeSelected, setSelectedNode } from '@/components/NodeProvider'
import { useDispatchTyped } from '@/redux/hooks'
import { moveNode } from '@/redux/programSlice'
import { moveNodeSockets, moveNodeSocketsStop } from '@/redux/socketsSlice'
import { fixedTheme } from '@/styles/themeCanvas'
import { Vec2D } from '@/types/util'

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

export type NodeProps = {
  children?: ReactNode
  nodeKey: string
  title: string
  x: number
  y: number
}

export default function Node(props: NodeProps) {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const nodeRef = useRef<HTMLDivElement>(null)
  const [canvasZoom, setCanvasZoom] = useState<number>(getCanvasZoom()) // variable is mirrored from NodeCanvas to enable state updates
  let lastNodePos: Vec2D | null = null // position of node before being dragged
  let nodePos: Vec2D | null = null // position of node while being dragged
  let isHovering = false

  const dispatch = useDispatchTyped()

  onZoomChanged((newZoom: number) => setCanvasZoom(newZoom))
  onNodeSelected(() => setHighlight())

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

  function onStart(event: DraggableEvent, data: DraggableData) {
    lastNodePos = { x: data.x, y: data.y }
    nodePos = { x: data.x, y: data.y }
  }

  function onDrag(event: DraggableEvent, data: DraggableData) {
    if (!nodePos)
      return
    moveNodeSockets(props.nodeKey, {
      x: data.x - nodePos.x,
      y: data.y - nodePos.y
    })
    nodePos = { x: data.x, y: data.y }
  }

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
        <div
          className={classes.header}
          onMouseOver={() => { isHovering = true; setHighlight() }}
          onMouseOut={() => { isHovering = false; setHighlight() }}
        >
          {props.title}
        </div>
        <Stack className={classes.content} justify="flex-start" spacing={fixedTheme.nodeFieldSpacing}>
          {props.children}
        </Stack>
      </div>
    </Draggable>
  )
}