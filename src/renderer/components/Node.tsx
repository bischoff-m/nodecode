import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import SelectField from './nodeComponents/SelectField';

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
  x: number,
  y: number
}

export default function Node(props: NodeProps) {
  const classes = useStyles();
  const [count, setCount] = useState(0);

  return (
    <div className={classes.card} style={{ left: props.x, top: props.y }}>
      <div className={classes.header}>
        Titel
      </div>
      <div className={classes.content}>
        Inhalt<br />
        <button onClick={() => setCount(count + 1)}>{count}</button>
        <SelectField />
      </div>
    </div>
  )
}
