import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, useRef } from 'react';
import Draggable from 'react-draggable';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    position: 'absolute',
    width: 300,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0px 0px 5px 0px rgb(0 0 0 / 30%)',
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
  title: string,
  x: number,
  y: number,
}

export default function Node(props: NodeProps) {
  const classes = useStyles();
  const nodeRef = useRef(null);

  return (
    <Draggable
      handle={'.' + classes.header}
      defaultPosition={{x: props.x, y: props.y}}
      grid={[20, 20]}
      nodeRef={nodeRef}
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