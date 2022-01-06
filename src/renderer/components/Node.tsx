import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    position: 'absolute',
    width: 300,
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    boxShadow: '0px 0px 5px 0px rgb(0 0 0 / 30%)',
  },
  header: {
    backgroundColor: theme.palette.primary.main,
    padding: 10,
  },
  content: {
    padding: 10,
  },
}));

type NodeProps = {
  children?: ReactNode
  title: string,
  x: number,
  y: number,
}

export default function Node(props: NodeProps) {
  const classes = useStyles();
  const [count, setCount] = useState(0);

  return (
    <div className={classes.card} style={{ left: props.x, top: props.y }}>
      <div className={classes.header}>
        {props.title}
      </div>
      <div className={classes.content}>
        {props.children}
      </div>
    </div>
  )
}
