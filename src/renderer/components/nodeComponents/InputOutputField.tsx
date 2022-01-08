import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

// TODO: implement MultiInput and datatypes
// TODO: add aditional checks for properties

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
    alignItems: 'center',
    paddingLeft: 3,
    paddingRight: 3,
  },
  label: {

  },
  connContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    height: 40,
    transform: 'translate(-18px, 0)',
    '& :first-child': {
      transform: 'translate(-7px, 13px)',
    },
    '& :nth-child(2)': {
      transform: 'translate(7px, 13px)',
    }
  },
  connector: {
    width: 14,
    height: 14,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 7,
  },
}));


type InputOutputFieldProps = {
  inputLabel?: string,
  outputLabel?: string,
}

export default function InputOutputField(props: InputOutputFieldProps) {
  const classes = useStyles();

  if (!props.inputLabel && !props.outputLabel)
    throw Error('No inputLabel and no outputLabel given to InputOutputField. It needs at least one of them.')

  return (
    <div className={classes.container}>
      <div className={classes.connContainer}>
        <div className={classes.connector} style={{ opacity: props.inputLabel ? 1 : 0 }}></div>
        <div className={classes.connector} style={{ opacity: props.outputLabel ? 1 : 0 }}></div>
      </div>
      <span className={classes.label} style={{ opacity: props.inputLabel ? 1 : 0 }}>
        {props.inputLabel}
      </span>
      <span className={classes.label} style={{ opacity: props.outputLabel ? 1 : 0 }}>
        {props.outputLabel}
      </span>
    </div>
  )
}