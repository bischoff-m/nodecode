import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks';
import { moveNode } from '@/redux/connectorsSlice';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

const gridSize = 20;

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    position: 'absolute',
    width: 300,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0px 0px 5px rgb(0 0 0 / 60%)',
  },
  header: {
    padding: 8,
    paddingLeft: 14,
    backgroundColor: theme.palette.primary.main,
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
  },
  content: {
    padding: '10px 15px 10px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
}));

export type NodeProps = {
  children?: ReactNode
  nodeKey: string,
  title: string,
  x: number,
  y: number,
}

export default function Node(props: NodeProps) {
  const classes = useStyles();
  const nodeRef = useRef(null);
  const canvasZoom = useSelectorTyped(state => state.canvas.zoom);

  const dispatch = useDispatchTyped();

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
      scale={((canvasZoom) - 1) * 0.972 + 1}
      grid={[gridSize, gridSize]}
      nodeRef={nodeRef}
      onDrag={handleDrag}
    >
      <div className={classes.card} ref={nodeRef}>
        <div className={classes.header}>
          {props.title}
        </div>
        <div className={classes.content}>
          {props.children}
        </div>
      </div>
    </Draggable>
  )
}