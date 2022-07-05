import { createStyles, useMantineTheme } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import Draggable, { DraggableEvent } from 'react-draggable'
import { useSelectorTyped } from '@/redux/hooks'
import { getCanvasZoom, screenToCanvas } from '@/components/NodeCanvas'
import { fixedTheme } from '@/styles/themeCanvas'
import { socketPositions as socketPos, onMoveNode, removeOnMoveNode } from '@/redux/socketsSlice'
import type { Vec2D } from '@/types/util'

const handleSize = fixedTheme.handleDraggableSize
let isDragging = false // is true when user began to drag and(!) moved his mouse

const useStyles = createStyles({
  svg: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  handle: {
    position: 'absolute',
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
  onSocketUpdate?: (leftSocketKey: string | undefined, rightSocketKey: string | undefined) => void
}

export default function Noodle(props: NoodleProps) {
  if (!props.defaultSocketKeyLeft && !props.defaultSocketKeyRight)
    throw new Error('Noodle: at least one default socket key is required')

  // Styles
  const { classes } = useStyles()
  const theme = useMantineTheme()

  // Refs
  const refLeft = useRef<HTMLDivElement>(null)
  const refRight = useRef<HTMLDivElement>(null)
  const refPath = useRef<SVGPathElement>(null)
  const refSVG = useRef<SVGSVGElement>(null)

  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)
  const socketPosAfterMove = useSelectorTyped((state) => state.sockets.positions)

  // React state
  const [mousePos, setMousePos] = useState<Vec2D>({ x: 0, y: 0 })
  const [socketKeyLeft, setSocketKeyLeft] = useState<string | undefined>(undefined)
  const [socketKeyRight, setSocketKeyRight] = useState<string | undefined>(undefined)
  // is true when user began to drag, even if he didnt move his mouse yet
  const [beganDragging, setBeganDragging] = useState<boolean>(false)


  // If a node that the noodle is connected to is moved, update the path of the noodle
  onMoveNode((nodeKey: string, by: Vec2D) => {
    if (!socketKeyLeft || !socketKeyRight || !refPath.current)
      return
    const leftNodeKey = allSockets[socketKeyLeft].nodeKey
    const rightNodeKey = allSockets[socketKeyRight].nodeKey
    if (nodeKey === leftNodeKey || nodeKey === rightNodeKey)
      refPath.current.setAttribute('d', getCurve())
  }, props.noodleID)

  // Additional checks for the socket key update methods
  const setKeyLeft = (key: string | undefined) => {
    if (!key && !socketKeyRight)
      throw new Error('Noodle: socketKeyLeft must be defined if socketKeyRight is undefined')
    setSocketKeyLeft(key)
  }
  const setKeyRight = (key: string | undefined) => {
    if (!key && !socketKeyLeft)
      throw new Error('Noodle: socketKeyRight must be defined if socketKeyLeft is undefined')
    setSocketKeyRight(key)
  }

  // takes a unique id for a socket and looks up the position
  function posFromSocketKey(socketKey: string): Vec2D {
    if (socketPos[socketKey]) return socketPos[socketKey]
    else throw Error(`Socket key not found: ${socketKey}`)
  }

  // calculates the distance to all sockets
  // then returns the position of the closest socket if its distance is below the snap threshold
  // and returns undefined otherwise
  function snapsToSocket(handlePos: Vec2D, excludeNode: string | undefined): string | undefined {
    if (!socketPosAfterMove || !allSockets) return undefined
    const [minSocketKey, minDistance] = Object
      .keys(socketPosAfterMove)
      .reduce((res, key) => {
        let pos = socketPosAfterMove[key]
        let distance = Math.sqrt((pos.x - handlePos.x) ** 2 + (pos.y - handlePos.y) ** 2)
        if (distance < res[1] && allSockets[key].nodeKey !== excludeNode) return [key, distance]
        else return res
      }, ['', Infinity] as [string, number])

    return minDistance <= handleSize / 2 ? minSocketKey : undefined
  }

  // updates state when one of the handles is dragged
  function handleDrag(isLeft: boolean, event: DraggableEvent): void {
    beganDragging && (isDragging = true)
    const e = event as ReactMouseEvent

    const newMousePos = screenToCanvas({ x: e.clientX, y: e.clientY })
    const setSocketKey = isLeft ? setKeyLeft : setKeyRight
    const otherSocketKey = isLeft ? socketKeyRight : socketKeyLeft
    const excludeNode = otherSocketKey ? allSockets[otherSocketKey].nodeKey : undefined
    const snapSocketKey = snapsToSocket(newMousePos, excludeNode)
    const snapSocket = snapSocketKey ? allSockets[snapSocketKey] : undefined
    if (snapSocketKey && (isLeft ? !snapSocket?.isInput : snapSocket?.isInput)) {
      // stick to nearest socket
      setSocketKey(snapSocketKey)
    } else {
      // stick to mouse
      setSocketKey(undefined)
    }
    setMousePos(newMousePos)
  }

  // defines the position of the two Draggable handles if they are not currently being dragged
  // after drag: if own socket is defined, stick to it
  //             otherwise if opposite socket is defined, stick to it
  //             otherwise return placeholder position (only happens during loading)
  function getHandlePos(isLeft: boolean) {
    const socketKey = isLeft ? socketKeyLeft : socketKeyRight
    const oppositeSocketKey = isLeft ? socketKeyRight : socketKeyLeft
    let handlePos = { x: 0, y: 0 }
    if (socketKey) handlePos = posFromSocketKey(socketKey)
    else if (oppositeSocketKey) handlePos = posFromSocketKey(oppositeSocketKey)
    return { x: handlePos.x - handleSize / 2, y: handlePos.y - handleSize / 2 }
  }

  // calculates the path (d-Attribute of svg.path) of the noodle for the current state (socketKeyLeft, socketKeyRight)
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

  useEffect(() => {
    return () => {
      removeOnMoveNode(props.noodleID)
    }
  }, [])

  useEffect(() => {
    setSocketKeyLeft(props.defaultSocketKeyLeft)
    setSocketKeyRight(props.defaultSocketKeyRight)
  }, [props])

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
          props.onSocketUpdate && props.onSocketUpdate(socketKeyLeft, socketKeyRight)
        }}
        onDrag={(event) => handleDrag(true, event)}
        scale={getCanvasZoom()}
      >
        <div
          className={`${classes.handle} handleLeft`}
          ref={refLeft}
          style={{
            display: socketKeyLeft !== undefined || !socketKeyRight ? 'none' : 'block',
            backgroundColor: 'red',
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
          props.onSocketUpdate && props.onSocketUpdate(socketKeyLeft, socketKeyRight)
        }}
        onDrag={(event) => handleDrag(false, event)}
        scale={getCanvasZoom()}
      >
        <div
          className={`${classes.handle} handleRight`}
          ref={refRight}
          style={{
            display: !socketKeyLeft && socketKeyRight !== undefined ? 'none' : 'block',
            backgroundColor: 'green',
          }}
        ></div>
      </Draggable>
    </>
  )
}
