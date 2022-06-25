import { createStyles, Paper, MantineSize, Stack } from '@mantine/core'
import { useDispatchTyped } from '@/redux/hooks'
import { moveNode } from '@/redux/socketsSlice'
import { ReactNode, useRef, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { getCanvasZoom, onZoomChanged } from './NodeCanvas'
import { fixedTheme } from '@/styles/theme_canvas'

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
  const nodeRef = useRef(null)
  const [canvasZoom, setCanvasZoom] = useState<number>(getCanvasZoom()) // variable is mirrored from NodeCanvas to enable state updates
  const [outlineActive, setOutlineActive] = useState<boolean>(false)

  const dispatch = useDispatchTyped()

  onZoomChanged((newZoom: number) => {
    setCanvasZoom(newZoom)
  })

  function handleDrag(event: DraggableEvent, data: DraggableData) {
    dispatch(
      moveNode({
        nodeKey: props.nodeKey,
        by: { x: data.deltaX, y: data.deltaY },
      })
    )
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
      onDrag={handleDrag}
      scale={canvasZoom}
    >
      <div
        className={`${classes.card} ${outlineActive ? classes.highlight : undefined
          }`}
        ref={nodeRef}
      >
        <div
          className={classes.header}
          onMouseOver={() => setOutlineActive(true)}
          onMouseOut={() => setOutlineActive(false)}
        >
          {props.title}
        </div>
        <Stack className={classes.content} justify="flex-start" spacing="sm">
          {props.children}
        </Stack>
      </div>
    </Draggable>
  )
}