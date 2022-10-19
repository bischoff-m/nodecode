/**
 * The `Noodle` component is used to connect nodes and consists of two hidden, but
 * draggable circles (handles) and an SVG to draw a Bézier curve between the two handles.
 * The handles can connect to the sockets of nodes and will snap to them if a handle
 * intersects the socket. To make the handles draggable, they are wrapped with the
 * `<Draggable></Draggable>` component from the library
 * [react-draggable](https://www.npmjs.com/package/react-draggable).
 * 
 * ### Left and Right Socket Keys
 *
 * To store which socket each handle is connected to, the React state variables
 * `socketKeyLeft` and `socketKeyRight` are used. If both sockets are defined, the handles
 * snap to the sockets and a curve from the left to the right socket/handle is displayed.
 *
 * If one of the socket keys is `undefined`, it means that the handle corresponding to the
 * undefined socket is either being dragged or that the noodle is collapsed. When
 * collapsed, both handles share the same position as the one socket that is defined.
 * These collapsed noodles are placed by
 * {@link "renderer/components/NoodleProvider".NoodleProvider} on sockets, that dont have
 * a connection. This allows the user to create new noodles by dragging from any output
 * socket or an empty input socket.
 *
 * There should always be at least one of the socket keys defined.
 * 
 * ### Drawing the Curve
 *
 * To draw the Bézier curve, the
 * [`<path>` SVG element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)
 * is used. The path always starts in one of the left corners of the SVG and ends in the
 * opposite corner on the right. The whole SVG element moves to where the curve should be
 * drawn and has inner padding, so that the curve does not get cut off when the right
 * handle is futher left than the left handle. The `d` attribute of the `<path>` element
 * is calculated by the function `getCurve()`.
 *
 * **Notes**
 *
 * > The theme variables `handleDraggableOpacity` and `noodleBackgroundOpacity` defined in
 * > {@link "renderer/styles/themeCanvas".fixedTheme} can be used to make the handles and
 * > the dimensions of the noodle container visible for debugging purposes.
 *
 * > I noticed that I used `undefined` as a placeholder value for when a noodle is
 * > collapsed. This is bad practice and should be replaced with `null` so that it can be
 * > distinguished from when a socket key is `undefined` due to a bug.
 *
 * @module
 */

import { createStyles, useMantineTheme } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import Draggable, { DraggableEvent } from 'react-draggable'
import { getCanvasZoom, screenToCanvas } from '@/components/NodeCanvas'
import { useSelectorTyped } from '@/redux/hooks'
import {
  socketPositions as socketPos,
  addNodeMovedListener,
  removeNodeMovedListener
} from '@/redux/socketsSlice'
import { fixedTheme } from '@/styles/themeCanvas'
import type { Vec2D } from '@/types/util'

/** Alias for the size of the area around each handle that can be dragged. */
const handleSize = fixedTheme.handleDraggableSize

/** Is true when the user began to drag and(!) moved his mouse. */
let isDragging = false

/** The position of the cursor in canvas coordinates. */
let mousePos: Vec2D = { x: 0, y: 0 }


/** {@link https://mantine.dev/styles/create-styles/} */
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

/** Alias for either a socket key or undefined. */
type MaybeKey = string | undefined

/** @category Component */
export type NoodleProps = {
  /** Socket that the left handle should initially be connected to. */
  keyLeft: MaybeKey
  /** Socket that the right handle should initially be connected to. */
  keyRight: MaybeKey
  /** Unique identifier of this noodle that is used in the global program state. */
  noodleID: string
  /** Function that should be called when one of the socket keys changes. */
  onSocketUpdate?: (leftSocketKey: MaybeKey, rightSocketKey: MaybeKey) => void
}

/** @category Component */
export default function Noodle(props: NoodleProps): JSX.Element {
  // Check for bugs
  if (!props.keyLeft && !props.keyRight)
    throw new Error('Noodle: at least one default socket key is required')


  ////////////////////////////////////////////////////////////////////////////////////////
  // Hooks
  ////////////////////////////////////////////////////////////////////////////////////////

  // Styles
  const { classes, cx } = useStyles()
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
  /** Is true when the user began to drag, even if he did not move his mouse yet. */
  const [beganDragging, setBeganDragging] = useState<boolean>(false)

  /** Socket key of the socket that the left handle is connected to. */
  const [socketKeyLeft, setSocketKeyLeft] = useState<MaybeKey>(undefined)
  /** Socket key of the socket that the right handle is connected to. */
  const [socketKeyRight, setSocketKeyRight] = useState<MaybeKey>(undefined)

  // Additional checks for the socket key update methods
  const setKeyLeft = (key: MaybeKey) => {
    if (!key && !socketKeyRight)
      throw new Error('Noodle: socketKeyLeft must be defined if socketKeyRight is undefined')
    setSocketKeyLeft(key)
  }
  const setKeyRight = (key: MaybeKey) => {
    if (!key && !socketKeyLeft)
      throw new Error('Noodle: socketKeyRight must be defined if socketKeyLeft is undefined')
    setSocketKeyRight(key)
  }

  // Effects
  useEffect(() => {
    return () => {
      removeNodeMovedListener(props.noodleID)
    }
  }, [])

  useEffect(() => {
    setSocketKeyLeft(props.keyLeft)
    setSocketKeyRight(props.keyRight)
  }, [props])


  // If a node that the noodle is connected to is moved, update the path of the noodle
  addNodeMovedListener((nodeKey: string) => {
    if (!socketKeyLeft || !socketKeyRight || !refPath.current)
      return
    // Check if the noodle is connected to the given node
    const leftNodeKey = allSockets[socketKeyLeft].nodeKey
    const rightNodeKey = allSockets[socketKeyRight].nodeKey
    // If connected, update the curve
    if (nodeKey === leftNodeKey || nodeKey === rightNodeKey)
      refPath.current.setAttribute('d', getCurve())
  }, props.noodleID)


  ////////////////////////////////////////////////////////////////////////////////////////
  // Component Functions
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Takes a socket key and looks up the position.
   * @param socketKey - Unique id for a socket
   * @returns The position of that socket on the canvas
   */
  function posFromSocketKey(socketKey: string): Vec2D {
    if (socketPos[socketKey]) return socketPos[socketKey]
    else throw new Error(`Socket key not found: ${socketKey}`)
  }

  /**
   * This function uses the position of a handle that is dragged to determine if the
   * handle should snap to a nearby socket.
   *
   * To do this, the function finds the socket with the smallest distance to the handle.
   * If it intersects with the handle, this means that the handle should snap to the
   * closest socket, so the function will return its socket key. Otherwise, it returns
   * `undefined`, because the handle should stick to the cursor.
   *
   * There is also the option to give a node to whose sockets the dragged handle should
   * not stick. This is used for example if the noodle is connected to an output socket on
   * the left. Then the right handle should not stick to input sockets of the same node.
   * @param handlePos - Position of the handle that is dragged.
   * @param excludeNode - Node key of a node whose sockets should be skipped.
   * @returns The socket key of the closest socket, if the handle should snap to it and
   *   `undefined` otherwise.
   */
  function snapsToSocket(handlePos: Vec2D, excludeNode?: string): MaybeKey {
    if (!socketPosAfterMove || !allSockets) return undefined
    const [minSocketKey, minDistance] = Object
      .keys(socketPosAfterMove)
      .reduce((res, key) => {
        const pos = socketPosAfterMove[key]
        const distance = Math.sqrt((pos.x - handlePos.x) ** 2 + (pos.y - handlePos.y) ** 2)
        if (distance < res[1] && allSockets[key].nodeKey !== excludeNode) return [key, distance]
        else return res
      }, ['', Infinity] as [string, number])

    return minDistance <= handleSize / 2 ? minSocketKey : undefined
  }

  /**
   * If they are currently not being dragged, this defines the position of the left and
   * right handles and is used as the controlled state of the `<Draggable></Draggable>`
   * elements used in this component.
   *
   * If the left handle is connected to an output socket (or the right handle to an input
   * socket respectively), this function places the handle on the socket it is connected
   * to. If either the left or the right handle is not connected to a socket, the noodle
   * should be collapsed. Then this function places both handles on the same socket.
   *
   * @param isLeft - Whether the position of the left or right handle should be returned.
   * @returns The own socket position of the given handle if defined, otherwise the
   *   opposite socket position.
   */
  function getHandlePos(isLeft: boolean): Vec2D {
    const socketKey = isLeft ? socketKeyLeft : socketKeyRight
    const oppositeSocketKey = isLeft ? socketKeyRight : socketKeyLeft

    // Choose which socket to connect to (own socket has priority over opposite socket)
    let handlePos = { x: NaN, y: NaN }
    if (socketKey) handlePos = posFromSocketKey(socketKey)
    else if (oppositeSocketKey) handlePos = posFromSocketKey(oppositeSocketKey)

    // Center the handle on the socket
    return { x: handlePos.x - handleSize / 2, y: handlePos.y - handleSize / 2 }
  }

  /**
   * Calculates the d-attribute of the
   * [`<path>` SVG element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)
   * to draw a cubic Bézier curve between the left and the right handle of this noodle.
   * The curve is updated repeatedly whenever one of the handles is dragged (see the
   * `onDrag` function) or one of the two nodes that the noodle could be attached to is
   * moved (see `addNodeMovedListener`).
   * @returns `d-attribute` of the `<path>` element that shows a cubic Bézier curve
   */
  function getCurve(): string {
    // Return a point if the noodle is collapsed or not mounted yet
    if (!refSVG.current || (!isDragging && (!socketKeyLeft || !socketKeyRight)))
      return 'M0 0 C 0 0, 0 0, 0 0'

    // Left and right anchor of bezier curve
    let posLeft: Vec2D
    let posRight: Vec2D

    // If the socket key is defined, the curve should start or end at the according socket
    // Otherwise, the curve should start or end at the cursor
    if (socketKeyLeft) {
      const socketPos = posFromSocketKey(socketKeyLeft)
      posLeft = { x: socketPos.x + fixedTheme.handleSize / 2, y: socketPos.y }
    } else {
      posLeft = mousePos
    }
    if (socketKeyRight) {
      const socketPos = posFromSocketKey(socketKeyRight)
      posRight = { x: socketPos.x - fixedTheme.handleSize / 2, y: socketPos.y }
    } else {
      posRight = mousePos
    }

    // Move svg container to top left handle position and add padding
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

    // Set width and height for svg container
    const width = maxX - minX + paddingX * 2
    const height = maxY - minY + paddingY * 2
    if (isNaN(width) || isNaN(height))
      return ''

    refSVG.current.setAttribute('width', `${width}px`)
    refSVG.current.setAttribute('height', `${height}px`)

    // Update path https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
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


  ////////////////////////////////////////////////////////////////////////////////////////
  // Event Listeners
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Updates the socket keys and the curve of the noodle and is called when one of the
   * handles is dragged. This triggers a component update if one of the handles is
   * connected or disconnected from a socket.
   * @param isLeft - Whether the left or right handle was dragged.
   * @param event - The event that was triggered when one of the handles was dragged.
   */
  function onDrag(isLeft: boolean, event: DraggableEvent): void {
    // Update the global variables
    beganDragging && (isDragging = true)
    const e = event as ReactMouseEvent
    mousePos = screenToCanvas({ x: e.clientX, y: e.clientY })

    // Check if the handle should snap to a socket
    const setSocketKey = isLeft ? setKeyLeft : setKeyRight
    const otherSocketKey = isLeft ? socketKeyRight : socketKeyLeft
    const excludeNode = otherSocketKey ? allSockets[otherSocketKey].nodeKey : undefined
    const snapSocketKey = snapsToSocket(mousePos, excludeNode)

    // Update the socket key state
    // Left handle should only connect to output and right handle only to input sockets
    const snapSocket = snapSocketKey ? allSockets[snapSocketKey] : undefined
    if (snapSocket && (isLeft ? !snapSocket.isInput : snapSocket.isInput)) {
      // Stick to nearest socket
      setSocketKey(snapSocketKey)
    } else {
      // Stick to mouse
      setSocketKey(undefined)
    }

    // Update the curve
    refPath.current?.setAttribute('d', getCurve())
  }

  /**
   * Is triggered after the user dragged a handle, updates the dragging variables and
   * calls the `onSocketUpdate` method that is provided by
   * {@link "renderer/components/NoodleProvider" NoodleProvider}. If the socket keys
   * changed, this will kill this instance of the `Noodle` component, because the socket
   * keys are used by the `NoodleProvider` to generate a unique and stable key for each
   * noodle. The key needs to change if the socket keys change, which makes this component
   * unmount.
   */
  function onStop(): void {
    setBeganDragging(false)
    isDragging = false
    props.onSocketUpdate && props.onSocketUpdate(socketKeyLeft, socketKeyRight)
  }


  ////////////////////////////////////////////////////////////////////////////////////////
  // Return
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <svg
        className={cx(
          classes.svg,
          beganDragging ? classes.aboveNodes : classes.belowNodes
        )}
        ref={refSVG}
      >
        {
          // Debugging background
          fixedTheme.noodleBackgroundOpacity > 0 &&
          <rect
            width="100%"
            height="100%"
            fill="blue"
            opacity={fixedTheme.noodleBackgroundOpacity}
          />
        }
        {/* Path element that renders as a bezier curve. */}
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

      {/* Left handle */}
      <Draggable
        handle={'.handleLeft'}
        position={getHandlePos(true)}
        nodeRef={refLeft}
        onStart={() => setBeganDragging(true)}
        onStop={onStop}
        onDrag={(event) => onDrag(true, event)}
        scale={getCanvasZoom()}
      >
        <div
          className={cx(classes.handle, 'handleLeft')}
          ref={refLeft}
          style={{
            display: socketKeyLeft !== undefined || !socketKeyRight ? 'none' : 'block',
            backgroundColor: 'red',
          }}
        ></div>
      </Draggable>

      {/* Right handle */}
      <Draggable
        handle={'.handleRight'}
        position={getHandlePos(false)}
        nodeRef={refRight}
        onStart={() => setBeganDragging(true)}
        onStop={onStop}
        onDrag={(event) => onDrag(false, event)}
        scale={getCanvasZoom()}
      >
        <div
          className={cx(classes.handle, 'handleRight')}
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
