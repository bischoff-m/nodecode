import { createStyles, Paper, MantineSize, Stack } from '@mantine/core';
import { useDispatchTyped } from '@/redux/hooks';
import { moveNode } from '@/redux/connectorsSlice';
import { ReactNode, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { getCanvasZoom, onZoomChanged } from './NodeCanvas';

const gridSize = 20;

const useStyles = createStyles((theme) => {
  const borderRadius = theme.defaultRadius as MantineSize;
  return ({
    card: {
      position: 'absolute',
      width: 300,
    },
    header: {
      padding: 8,
      paddingLeft: 14, // TODO: use mantine padding instead (sm, lg, xl, ...)
      backgroundColor: theme.colors.blue[9],
      borderTopLeftRadius: theme.radius[borderRadius],
      borderTopRightRadius: theme.radius[borderRadius],
    },
    content: {
      padding: theme.other.nodePadding,
    },
  })
});

export type NodeProps = {
  children?: ReactNode
  nodeKey: string,
  title: string,
  x: number,
  y: number,
}

export default function Node(props: NodeProps) {
  const { classes } = useStyles();
  const nodeRef = useRef(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(getCanvasZoom()); // variable is mirrored from NodeCanvas to enable state updates

  const dispatch = useDispatchTyped();

  onZoomChanged((newZoom: number) => {
    setCanvasZoom(newZoom);
  })

  function handleDrag(event: DraggableEvent, data: DraggableData) {
    dispatch(moveNode({
      nodeKey: props.nodeKey,
      by: { x: data.deltaX, y: data.deltaY }
    }))
  }

  return (
    <Draggable
      handle={'.' + classes.header}
      defaultPosition={{ x: props.x, y: props.y }}
      grid={[gridSize * canvasZoom, gridSize * canvasZoom]}
      nodeRef={nodeRef}
      onDrag={handleDrag}
      scale={canvasZoom}
    >
      <Paper className={classes.card} ref={nodeRef}>
        <div className={classes.header}>
          {props.title}
        </div>
        <Stack className={classes.content} justify="flex-start" spacing="sm">
          {props.children}
        </Stack>
      </Paper>
    </Draggable>
  )
}