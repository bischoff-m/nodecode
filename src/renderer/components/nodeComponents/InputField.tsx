import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    // backgroundColor: 'red',
    height: 40,
    alignItems: 'center',
    paddingLeft: 3,
    paddingRight: 3,
  },
  label: {
    
  },
  inputCircle: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 7,
    transform: 'translate(-25px, 0)',
  }
}));


type InputFieldProps = {
  label: string,
}

export default function InputField(props: InputFieldProps) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.inputCircle}></div>
      <span className={classes.label}>
        {props.label}
      </span>
    </div>
  )
}