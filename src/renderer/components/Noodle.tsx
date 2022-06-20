import { createStyles, useMantineTheme } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import Draggable, { DraggableEvent } from 'react-draggable'
import { useSelectorTyped } from '@/redux/hooks'
import { getCanvasZoom, screenToCanvas } from '@/components/NodeCanvas'
import { Vec2D } from '@/types/util'
import type { Socket } from '@/redux/socketsSlice'
import { fixedTheme } from '@/styles/theme_canvas'

const handleSize = fixedTheme.handleDraggableSize
let isDragging = false // is true when user began to drag and(!) moved his mouse

const useStyles = createStyles({
  svg: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  handle: {
    position: 'absolute',
    backgroundColor: 'red',
    width: handleSize,
    height: handleSize,
    borderRadius: handleSize / 2,
    opacity: fixedTheme.handleDraggableOpacity,
    zIndex: 1000,
  },
  aboveNodes: { zIndex: 500 },
  belowNodes: { zIndex: 10 },
})

type NoodleProps = {
  defaultSocketKeyLeft?: string
  defaultSocketKeyRight?: string
  noodleID: string
}

export default function Noodle(props: NoodleProps) {
  // Styles
  const { classes } = useStyles()
  const theme = useMantineTheme()

  // Refs
  const refLeft = useRef<HTMLDivElement>(null)
  const refRight = useRef<HTMLDivElement>(null)
  const refPath = useRef<SVGPathElement>(null)
  const refSVG = useRef<SVGSVGElement>(null)

  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.sockets)

  // React state
  const [mousePos, setMousePos] = useState<Vec2D>({ x: 0, y: 0 })
  const [socketKeyLeft, setSocketKeyLeft] = useState<string | undefined>(undefined)
  const [socketKeyRight, setSocketKeyRight] = useState<string | undefined>(undefined)
  // is true when user began to drag, even if he didnt move his mouse yet
  const [beganDragging, setBeganDragging] = useState<boolean>(
    props.defaultSocketKeyLeft && props.defaultSocketKeyRight ? false : true,
  )

  if (!props.defaultSocketKeyLeft && !props.defaultSocketKeyRight)
    throw new Error('Noodle: at least one default socket key is required')

  useEffect(() => {
    setSocketKeyLeft(props.defaultSocketKeyLeft)
    setSocketKeyRight(props.defaultSocketKeyRight)
  }, [props])

  function posFromSocketKey(socketKey: string): Vec2D {
    // Takes a unique id for a socket and looks up the position
    let socket = allSockets.find((socket) => socket.socketKey === socketKey)
    if (socket) return socket.pos
    else throw Error(`Socket key not found: ${socketKey}`)
  }

  function snapsToSocket(handlePos: Vec2D): Socket | undefined {
    // calculates the distance to all sockets
    // then returns the position of the closest socket if its distance is below the snap threshold
    // and returns undefined otherwise
    const socketDistances = allSockets.map((socket) =>
      Math.sqrt((socket.pos.x - handlePos.x) ** 2 + (socket.pos.y - handlePos.y) ** 2),
    )
    const minDistance = Math.min(...socketDistances)
    if (minDistance <= handleSize / 2)
      return allSockets[socketDistances.indexOf(minDistance)]
    else return undefined
  }

  function handleDrag(isLeft: boolean, event: DraggableEvent): void {
    beganDragging && (isDragging = true)
    const e = event as ReactMouseEvent

    const newMousePos = screenToCanvas({ x: e.clientX, y: e.clientY })
    const setSocketKey = isLeft ? setSocketKeyLeft : setSocketKeyRight
    const snapSocket = snapsToSocket(newMousePos)
    if (snapSocket && (isLeft ? !snapSocket.isInput : snapSocket.isInput)) {
      // stick to nearest socket
      setSocketKey(snapSocket.socketKey)
    } else {
      // stick to mouse
      setSocketKey(undefined)
    }
    setMousePos(newMousePos)
  }

  function getHandlePos(isLeft: boolean) {
    // Called when handles are dragged
    // TODO: document logic
    const socketKey = isLeft ? socketKeyLeft : socketKeyRight
    const oppositeSocketKey = isLeft ? socketKeyRight : socketKeyLeft
    let handlePos = mousePos
    if (socketKey) handlePos = posFromSocketKey(socketKey)
    else if (oppositeSocketKey) handlePos = posFromSocketKey(oppositeSocketKey)
    return { x: handlePos.x - handleSize / 2, y: handlePos.y - handleSize / 2 }
  }

  function getCurve() {
    if (!refSVG.current || !(isDragging || (socketKeyLeft && socketKeyRight)))
      return 'M0 0 C 0 0, 0 0, 0 0'

    // left and right anchor of bezier curve
    let posLeft: Vec2D
    let posRight: Vec2D

    if (socketKeyLeft) {
      let socketPos = posFromSocketKey(socketKeyLeft)
      posLeft = { x: socketPos.x + 7, y: socketPos.y }
    } else {
      posLeft = mousePos
    }
    if (socketKeyRight) {
      let socketPos = posFromSocketKey(socketKeyRight)
      posRight = { x: socketPos.x - 7, y: socketPos.y }
    } else {
      posRight = mousePos
    }

    // move svg container to top left handle position
    const minX = Math.min(posLeft.x, posRight.x)
    const minY = Math.min(posLeft.y, posRight.y)
    const maxX = Math.max(posLeft.x, posRight.x)
    const maxY = Math.max(posLeft.y, posRight.y)
    const paddingX = (maxX - minX) / 2 + handleSize
    const paddingY = 4 * handleSize
    refSVG.current.setAttribute(
      'style',
      `transform: translate(${minX - paddingX}px, ${minY - paddingY}px)`,
    )

    // set width and height for svg
    const width = maxX - minX + paddingX * 2
    const height = maxY - minY + paddingY * 2
    refSVG.current.setAttribute('width', `${width}px`)
    refSVG.current.setAttribute('height', `${height}px`)

    // update path https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    const isInvertedX = posLeft.x > posRight.x
    const isInvertedY = posLeft.y > posRight.y
    const x1 = !isInvertedX ? paddingX : width - paddingX
    const y1 = !isInvertedY ? paddingY : height - paddingY
    const x2 = x1 + width / 2 - paddingX
    const y2 = y1
    const x4 = !isInvertedX ? width - paddingX : paddingX
    const y4 = !isInvertedY ? height - paddingY : paddingY
    const x3 = x4 - width / 2 + paddingX
    const y3 = y4

    return `M${x1} ${y1} C ${x2} ${y2}, ${x3} ${y3}, ${x4} ${y4}`
  }

  return (
    <>
      <svg
        className={`${classes.svg} ${beganDragging ? classes.aboveNodes : classes.belowNodes}`}
        ref={refSVG}
      >
        {
          fixedTheme.noodleBackgroundOpacity > 0 &&
          <rect width="100%" height="100%" fill="blue" opacity={fixedTheme.noodleBackgroundOpacity} />
        }
        <path
          ref={refPath}
          d={getCurve()}
          style={{
            display: beganDragging || (socketKeyLeft && socketKeyRight) ? '' : 'none',
          }}
          id={`svg_${props.noodleID}`}
          strokeWidth="2"
          stroke={theme.other.noodleColor}
          fill="none"
        />
      </svg>
      <Draggable
        handle={'.handleLeft'}
        position={getHandlePos(true)}
        nodeRef={refLeft}
        onStart={() => setBeganDragging(true)}
        onStop={() => {
          setBeganDragging(false)
          isDragging = false
        }}
        onDrag={(event) => handleDrag(true, event)}
        scale={getCanvasZoom()}
      >
        <div
          className={`${classes.handle} handleLeft`}
          ref={refLeft}
          style={{
            display: socketKeyLeft !== undefined || !socketKeyRight ? 'none' : 'block',
          }}
        ></div>
      </Draggable>
      <Draggable
        handle={'.handleRight'}
        position={getHandlePos(false)}
        nodeRef={refRight}
        onStart={() => setBeganDragging(true)}
        onStop={() => {
          setBeganDragging(false)
          isDragging = false
        }}
        onDrag={(event) => handleDrag(false, event)}
        scale={getCanvasZoom()}
      >
        <div
          className={`${classes.handle} handleRight`}
          ref={refRight}
          style={{
            display: !socketKeyLeft && socketKeyRight !== undefined ? 'none' : 'block',
          }}
        ></div>
      </Draggable>
    </>
  )
}
