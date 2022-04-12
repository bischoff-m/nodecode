import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';
import { useSelectorTyped } from '@/redux/hooks';
import { getScreenOffset, getCanvasZoom, screenToCanvas, canvasToScreen } from '@/components/NodeCanvas';
import { Coord2D } from '@/types/util';
import type { Connector } from '@/redux/connectorsSlice';

const handleSize = 40;

const useStyles = makeStyles((theme: Theme) => ({
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
    opacity: 0.5,
    zIndex: 1000,
  },
  aboveNodes: { zIndex: 500 },
  belowNodes: { zIndex: 10 },
}));

type CurveConnectionProps = {
  defaultConnKeyLeft: string,
  defaultConnKeyRight: string,
  curveID: string,
}

export default function CurveConnection(props: CurveConnectionProps) {
  // Styles
  const classes = useStyles();

  // Refs
  const refLeft = useRef<HTMLDivElement>(null);
  const refRight = useRef<HTMLDivElement>(null);
  const refPath = useRef<SVGPathElement>(null);
  const refSVG = useRef<SVGSVGElement>(null);

  // Redux state
  const connectCoords = useSelectorTyped(state => state.connectors.coordinates);

  // React state
  const [mousePos, setMousePos] = useState<Coord2D>({ x: 0, y: 0 });
  const [connKeyLeft, setConnKeyLeft] = useState<string | undefined>(undefined);
  const [connKeyRight, setConnKeyRight] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState<boolean>(props.defaultConnKeyLeft && props.defaultConnKeyRight ? false : true)

  useEffect(() => {
    setConnKeyLeft(props.defaultConnKeyLeft)
    setConnKeyRight(props.defaultConnKeyRight)
  }, [props])

  function coordsFromConnKey(connKey: string) {
    // Takes a unique id for a connector and looks up the coordinates
    let conn = connectCoords.find(conn => conn.connKey === connKey)
    if (conn)
      return conn.coords
    else throw Error(`Connector key not found: ${connKey}`)
  }

  function snapsToConn(handlePos: Coord2D): Connector | undefined {
    // calculates the distance to all connectors
    // then returns the coordinates of the closest connector if its distance is below the snap threshold
    // and returns undefined otherwise
    const connectDistances = connectCoords.map(conn => Math.sqrt((conn.coords.x - handlePos.x) ** 2 + (conn.coords.y - handlePos.y) ** 2))
    const minDistance = Math.min(...connectDistances)
    if (minDistance <= handleSize / 2)
      return connectCoords[connectDistances.indexOf(minDistance)]
    else
      return undefined
  }

  function handleDrag(isLeft: boolean, event: DraggableEvent) {
    const e = event as ReactMouseEvent;
    const screenOffset = getScreenOffset()
    const canvasZoom = getCanvasZoom()
    const clientPos = canvasToScreen({ x: e.clientX, y: e.clientY })
    const newMousePos = { x: (clientPos.x - screenOffset.x) / canvasZoom, y: (clientPos.y - screenOffset.y) / canvasZoom }

    const setConnKey = isLeft ? setConnKeyLeft : setConnKeyRight
    const snapConn = snapsToConn(newMousePos)
    if (snapConn && (isLeft ? !snapConn.isInput : snapConn.isInput)) {
      // stick to nearest connector
      setConnKey(snapConn.connKey)
    } else {
      // stick to mouse
      setConnKey(undefined)
    }
    setMousePos(newMousePos)
  }

  function getHandlePos(isLeft: boolean) {
    // Called when handles are dragged
    // TODO: document logic
    const connKey = isLeft ? connKeyLeft : connKeyRight
    const oppositeConnKey = isLeft ? connKeyRight : connKeyLeft
    let handlePos = mousePos;
    if (connKey)
      handlePos = coordsFromConnKey(connKey)
    else if (oppositeConnKey)
      handlePos = coordsFromConnKey(oppositeConnKey)
    return { x: handlePos.x - handleSize / 2, y: handlePos.y - handleSize / 2 }
  }

  function getCurve() {
    if (!refSVG.current)
      return "M0 0 C 0 0, 0 0, 0 0"

    // left and right anchor of bezier curve
    let posLeft: Coord2D;
    let posRight: Coord2D;

    if (connKeyLeft) {
      let connPos = coordsFromConnKey(connKeyLeft)
      posLeft = { x: connPos.x + 7, y: connPos.y }
    } else {
      posLeft = mousePos
    }
    if (connKeyRight) {
      let connPos = coordsFromConnKey(connKeyRight)
      posRight = { x: connPos.x - 7, y: connPos.y }
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
    refSVG.current.setAttribute('style', `transform: translate(${minX - paddingX}px, ${minY - paddingY}px)`)

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
      <svg className={`${classes.svg} ${isDragging ? classes.aboveNodes : classes.belowNodes}`} ref={refSVG}>
        {/* TODO: remove */}
        {/* <rect width="100%" height="100%" fill="blue" opacity={0.2} /> */}
        <path
          ref={refPath}
          d={getCurve()}
          style={{ display: isDragging || (connKeyLeft && connKeyRight) ? '' : 'none' }}
          id={`svg_${props.curveID}`}
          strokeWidth="2"
          stroke="#fff"
          fill="none"
        />
      </svg>
      <Draggable
        handle={'.handleLeft'}
        position={getHandlePos(true)}
        nodeRef={refLeft}
        disabled={true}
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
        onDrag={event => handleDrag(true, event)}
        scale={getCanvasZoom()}
      >
        <div className={`${classes.handle} handleLeft`} ref={refLeft}></div>
      </Draggable>
      <Draggable
        handle={'.handleRight'}
        position={getHandlePos(false)}
        nodeRef={refRight}
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
        onDrag={event => handleDrag(false, event)}
        scale={getCanvasZoom()}
      >
        <div className={`${classes.handle} handleRight`} ref={refRight}></div>
      </Draggable>
    </>
  )
}
