import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
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

export default function App() {
  const classes = useStyles();
  return (
    <div className={classes.card}>
      <div className={classes.header}>
        Titel
      </div>
      <div className={classes.content}>
        Inhalt<br/>
        Inhalt<br/>
        Inhalt<br/>
        Inhalt<br/>
        Inhalt<br/>
      </div>
    </div>
  )
}
