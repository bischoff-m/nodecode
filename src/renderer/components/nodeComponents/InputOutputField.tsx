import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { registerConnector } from '@/redux/connectorsSlice';
import { useDispatchTyped } from '@/redux/hooks';
import { useEffect, useRef } from 'react';
import type { FieldProps } from '@/types/util';
import { getCanvasOrigin } from '@/components/NodeCanvas';

// TODO: implement MultiInput and datatypes
// TODO: add aditional checks for properties
const handleSize = 14;

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
    width: handleSize,
    height: handleSize,
    backgroundColor: theme.palette.primary.main,
    borderRadius: handleSize / 2,
  },
}));


type InputOutputFieldProps = {
  inputLabel?: string,
  outputLabel?: string,
} & FieldProps

export default function InputOutputField(props: InputOutputFieldProps) {
  if (!props.inputLabel && !props.outputLabel)
    throw Error('No inputLabel and no outputLabel given to InputOutputField. It needs at least one of them.')

  const classes = useStyles();
  const leftHandleRef = useRef<HTMLDivElement>(null);
  const rightHandleRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatchTyped();

  useEffect(() => {
    if (!leftHandleRef.current || !rightHandleRef.current)
      return

    const canvasOrigin = getCanvasOrigin();
    const leftCoords = leftHandleRef.current.getBoundingClientRect()
    const rightCoords = rightHandleRef.current.getBoundingClientRect()
    
    props.inputLabel && dispatch(registerConnector({
      connKey: `${props.nodeKey}.${props.fieldKey}.left`,
      coords: {
        x: leftCoords.x - canvasOrigin.x + handleSize / 2,
        y: leftCoords.y - canvasOrigin.y + handleSize / 2,
      },
      isInput: true,
    }))
    props.outputLabel && dispatch(registerConnector({
      connKey: `${props.nodeKey}.${props.fieldKey}.right`,
      coords: {
        x: rightCoords.x - canvasOrigin.x + handleSize / 2,
        y: rightCoords.y - canvasOrigin.y + handleSize / 2,
      },
      isInput: false,
    }))
  }, [])

  return (
    <div className={classes.container}>
      <div className={classes.connContainer}>
        <div className={classes.connector} style={{ opacity: props.inputLabel ? 1 : 0 }} ref={leftHandleRef}></div>
        <div className={classes.connector} style={{ opacity: props.outputLabel ? 1 : 0 }} ref={rightHandleRef}></div>
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