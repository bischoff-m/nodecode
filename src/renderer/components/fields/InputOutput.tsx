import { createStyles } from '@mantine/core'
import { updateSocket, addSocket } from '@/redux/socketsSlice'
import { useDispatchTyped } from '@/redux/hooks'
import { useEffect, useRef } from 'react'
import type { FieldProps } from '@/types/util'
import { screenToCanvas } from '@/components/NodeCanvas'
import { fixedTheme } from '@/styles/theme_canvas'

// TODO: implement multiple connections on the same socket and datatypes
// TODO: add aditional checks for properties
// TODO: handle position needs to updated when node is updated (for example a list is expanded)

const { handleSize, fieldDefaultHeight, nodePadding } = fixedTheme

const useStyles = createStyles((theme) => ({
  container: {
    display: 'grid',
    height: fieldDefaultHeight,
    alignItems: 'center',
    '& > div': {
      gridRow: 1,
      gridColumn: 1,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    }
  },
  labelContainer: {
    paddingLeft: fixedTheme.fieldLabelMargin,
    paddingRight: fixedTheme.fieldLabelMargin,
    fontSize: theme.fontSizes.lg,
    color: theme.other.textColor,
  },
  socketContainer: {
    '& :first-of-type': {
      transform: `translateX(${-handleSize / 2 - nodePadding}px)`,
    },
    '& :last-of-type': {
      transform: `translateX(${handleSize / 2 + nodePadding}px)`,
    }
  },
  socket: {
    width: handleSize,
    height: handleSize,
    backgroundColor: theme.other.socketColor,
    borderRadius: handleSize / 2,
  },
}))


type InputOutputFieldProps = {
  inputLabel?: string,
  outputLabel?: string,
} & FieldProps

export default function InputOutputField(props: InputOutputFieldProps) {
  if (!props.inputLabel && !props.outputLabel)
    throw Error('No inputLabel and no outputLabel given to InputOutputField. It needs at least one of them.')

  const { classes } = useStyles()
  const leftHandleRef = useRef<HTMLDivElement>(null)
  const rightHandleRef = useRef<HTMLDivElement>(null)

  const dispatch = useDispatchTyped()

  useEffect(() => {
    if (!leftHandleRef.current || !rightHandleRef.current)
      return

    const leftPos = leftHandleRef.current.getBoundingClientRect()
    const rightPos = rightHandleRef.current.getBoundingClientRect()

    Array(true, false).forEach(isLeft => {
      const pos = screenToCanvas(isLeft ? leftPos : rightPos)
      if (isLeft ? props.inputLabel : props.outputLabel) {
        const socket = {
          nodeKey: props.nodeKey,
          fieldKey: props.fieldKey,
          isInput: isLeft,
        }
        dispatch(addSocket({
          socket: socket,
          pos: {
            x: pos.x + handleSize / 2,
            y: pos.y + handleSize / 2,
          },
        }))
        dispatch(updateSocket(socket))
      }
    })
  }, [])

  return (
    <div className={classes.container}>
      <div className={classes.socketContainer}>
        <div className={classes.socket} style={{ opacity: props.inputLabel ? 1 : 0 }} ref={leftHandleRef}></div>
        <div className={classes.socket} style={{ opacity: props.outputLabel ? 1 : 0 }} ref={rightHandleRef}></div>
      </div>
      <div className={classes.labelContainer}>
        <span style={{ opacity: props.inputLabel ? 1 : 0 }}>
          {props.inputLabel}
        </span>
        <span style={{ opacity: props.outputLabel ? 1 : 0 }}>
          {props.outputLabel}
        </span>
      </div>
    </div>
  )
}