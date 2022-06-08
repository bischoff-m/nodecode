import { createStyles, useMantineTheme } from '@mantine/core';
import { updateSocket } from '@/redux/socketsSlice';
import { useDispatchTyped } from '@/redux/hooks';
import { useEffect, useRef } from 'react';
import type { FieldProps } from '@/types/util';
import { screenToCanvas } from '@/components/NodeCanvas';

// TODO: implement multiple connections on the same socket and datatypes
// TODO: add aditional checks for properties
// TODO: handle position needs to updated when node is updated (for example a list is expanded)

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: theme.other.fieldHeight,
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
  },
  socketContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    height: theme.other.fieldHeight,
    transform: `translate(-${theme.other.nodePadding + 5}px, 0)`,
    '& :first-of-type': {
      transform: `translate(-${theme.other.handleSize / 2}px, ${(theme.other.fieldHeight - theme.other.handleSize) / 2}px)`,
    },
    '& :last-of-type': {
      transform: `translate(${theme.other.handleSize / 2}px, ${(theme.other.fieldHeight - theme.other.handleSize) / 2}px)`,
    }
  },
  socket: {
    width: theme.other.handleSize,
    height: theme.other.handleSize,
    backgroundColor: theme.colors.blue[9],
    borderRadius: theme.other.handleSize / 2,
  },
}));


type InputOutputFieldProps = {
  inputLabel?: string,
  outputLabel?: string,
} & FieldProps

export default function InputOutputField(props: InputOutputFieldProps) {
  if (!props.inputLabel && !props.outputLabel)
    throw Error('No inputLabel and no outputLabel given to InputOutputField. It needs at least one of them.')

  const { classes } = useStyles();
  const theme = useMantineTheme();
  const leftHandleRef = useRef<HTMLDivElement>(null);
  const rightHandleRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatchTyped();

  useEffect(() => {
    if (!leftHandleRef.current || !rightHandleRef.current)
      return

    const leftPos = leftHandleRef.current.getBoundingClientRect()
    const rightPos = rightHandleRef.current.getBoundingClientRect()

    Array(true, false).forEach(isLeft => {
      const pos = screenToCanvas(isLeft ? leftPos : rightPos)
      if (isLeft ? props.inputLabel : props.outputLabel)
        dispatch(updateSocket({
          socketKey: `${props.nodeKey}.${props.fieldKey}.${isLeft ? 'left' : 'right'}`,
          nodeKey: props.nodeKey,
          fieldKey: props.fieldKey,
          pos: {
            x: pos.x + theme.other.handleSize / 2,
            y: pos.y + theme.other.handleSize / 2,
          },
          isInput: isLeft,
        }))
    })
  }, [])

  return (
    <div className={classes.container}>
      <div className={classes.socketContainer}>
        <div className={classes.socket} style={{ opacity: props.inputLabel ? 1 : 0 }} ref={leftHandleRef}></div>
        <div className={classes.socket} style={{ opacity: props.outputLabel ? 1 : 0 }} ref={rightHandleRef}></div>
      </div>
      <span style={{ opacity: props.inputLabel ? 1 : 0 }}>
        {props.inputLabel}
      </span>
      <span style={{ opacity: props.outputLabel ? 1 : 0 }}>
        {props.outputLabel}
      </span>
    </div>
  )
}