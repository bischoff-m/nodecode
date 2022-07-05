import { createStyles, MantineSize, Stack, useMantineTheme } from '@mantine/core'
import { useDispatchTyped } from '@/redux/hooks'
import { moveNode, moveNodeStop } from '@/redux/socketsSlice'
import { useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { getCanvasZoom, getSelectedNode, onNodeSelected, onZoomChanged, setSelectedNode } from '@/components/NodeCanvas'
import { fixedTheme } from '@/styles/themeCanvas'
import type { DraggableData, DraggableEvent } from 'react-draggable'
import type { ReactNode } from 'react'

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
  const moveDelta = { x: 0, y: 0 }
  let isHovering = false

  const dispatch = useDispatchTyped()

  onZoomChanged((newZoom: number) => {
    setCanvasZoom(newZoom)
  })
  onNodeSelected(() => setHighlight())

  function onDrag(event: DraggableEvent, data: DraggableData) {
    moveDelta.x += data.deltaX
    moveDelta.y += data.deltaY
    moveNode(props.nodeKey, { x: data.deltaX, y: data.deltaY })
  }

  function onStop(event: DraggableEvent, data: DraggableData) {
    if (moveDelta.x === 0 && moveDelta.y === 0)
      return
    dispatch(moveNodeStop({
      nodeKey: props.nodeKey,
      by: moveDelta,
    }))
    moveDelta.x = 0
    moveDelta.y = 0
  }

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

  return (
    <Draggable
      handle={'.' + classes.header}
      defaultPosition={{ x: props.x, y: props.y }}
      grid={[
        fixedTheme.gridSize * canvasZoom,
        fixedTheme.gridSize * canvasZoom,
      ]}
      nodeRef={nodeRef}
      onDrag={onDrag}
      onStop={onStop}
      scale={canvasZoom}
    >
      <div
        className={classes.card}
        ref={nodeRef}
        onClick={(e) => { e.stopPropagation(); setSelectedNode(props.nodeKey) }}
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