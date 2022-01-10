import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';
import { useSelectorTyped } from '@/redux/hooks';
import { Coord2D } from '@/types/util';
import { getCanvasOrigin } from '@/components/NodeCanvas';
import type { Connector } from '@/redux/connectorsSlice';

const handleSize = 40;
let connKeyLeft: string | undefined;
let connKeyRight: string | undefined;

const useStyles = makeStyles((theme: Theme) => ({
  handle: {
    position: 'absolute',
    backgroundColor: 'red',
    width: handleSize,
    height: handleSize,
    borderRadius: handleSize / 2,
    opacity: 0.5,
  },
  svg: {
    position: 'absolute',
    pointerEvents: 'none',
  }
}));

type SvgTestProps = {
  defaultConnKeyLeft: string,
  defaultConnKeyRight: string,
}

export default function SvgTest(props: SvgTestProps) {
  const classes = useStyles();
  const refLeft = useRef<HTMLDivElement>(null);
  const refRight = useRef<HTMLDivElement>(null);
  const refPath = useRef<SVGPathElement>(null);
  const refSVG = useRef<SVGSVGElement>(null);
  const connectCoords = useSelectorTyped(state => state.connectors.coordinates);
  // const mousePos = useState<Coord2D>({ x: 0, y: 0 });
  const [posLeft, setPosLeft] = useState<Coord2D>({ x: 0, y: 0 });
  const [posRight, setPosRight] = useState<Coord2D>({ x: 0, y: 0 });

  useEffect(() => {
    connKeyLeft = props.defaultConnKeyLeft
    connKeyRight = props.defaultConnKeyRight
    setPosLeft(coordsFromConnKey(connKeyLeft))
    setPosRight(coordsFromConnKey(connKeyRight))
    updateCurve();
  }, [])

  function coordsFromConnKey(connKey: string) {
    let conn = connectCoords.find(conn => conn.connKey === connKey)
    if (conn)
      return conn.coords
    else throw Error(`Connector key not found: ${connKey}`)
  }

  function snapsToConn(handlePos: Coord2D): Connector | undefined {
    const connectDistances = connectCoords.map(conn => Math.sqrt((conn.coords.x - handlePos.x) ** 2 + (conn.coords.y - handlePos.y) ** 2))
    const minDistance = Math.min(...connectDistances)
    if (minDistance <= handleSize / 2)
      return connectCoords[connectDistances.indexOf(minDistance)]
    else
      return undefined
  }

  function handleDrag(isLeftHandle: boolean, event: DraggableEvent) {
    // TODO: dont allow connection of two inputs or two outputs
    const e = event as ReactMouseEvent;
    const canvasOrigin = getCanvasOrigin();
    const mousePos = { x: e.clientX - canvasOrigin.x, y: e.clientY - canvasOrigin.y }

    const setPos = isLeftHandle ? setPosLeft : setPosRight
    const snapConn = snapsToConn(mousePos)
    if (snapConn) {
      // stick to nearest connector
      setPos({ ...snapConn.coords })
    } else {
      // stick to mouse
      setPos({ x: mousePos.x, y: mousePos.y })
    }
    updateCurve()
  }

  function handleDragStop(isLeftHandle: boolean, event: DraggableEvent) {
    // if handle snapped to connector: update connKey for handle
    const handlePos = isLeftHandle ? posLeft : posRight
    const setPos = isLeftHandle ? setPosLeft : setPosRight
    const setConnKey = (k: string) => isLeftHandle ? connKeyLeft = k : connKeyRight = k

    const snapConn = snapsToConn(handlePos)
    if (snapConn) {
      setConnKey(snapConn.connKey)
      setPos({ ...snapConn.coords })
    }
  }

  function updateCurve(): void {
    if (!refPath.current || !refSVG.current || !refLeft.current || !refRight.current)
      return

    // calculate position of handles relative to canvas
    // const canvasOrigin = getCanvasOrigin()
    // const leftPosAbsolute = refLeft.current.getBoundingClientRect()
    // const rightPosAbsolute = refRight.current.getBoundingClientRect()
    // const posLeft = {
    //   x: leftPosAbsolute.x + handleSize / 2 - canvasOrigin.x,
    //   y: leftPosAbsolute.y + handleSize / 2 - canvasOrigin.y,
    // }
    // const posRight = {
    //   x: rightPosAbsolute.x + handleSize / 2 - canvasOrigin.x,
    //   y: rightPosAbsolute.y + handleSize / 2 - canvasOrigin.y,
    // }
    // console.log(posLeft.x, posLeft.x)

    // move svg container to top left handle position
    const minX = Math.min(posLeft.x, posRight.x)
    const minY = Math.min(posLeft.y, posRight.y)
    const padding = 4 * handleSize
    refSVG.current.setAttribute('style', `transform: translate(${minX - padding}px, ${minY - padding}px)`)

    // set width and height for svg
    const maxX = Math.max(posLeft.x, posRight.x)
    const maxY = Math.max(posLeft.y, posRight.y)
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2
    refSVG.current.setAttribute('width', `${width}px`)
    refSVG.current.setAttribute('height', `${height}px`)

    // update path https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    const inverted = (posLeft.x > posRight.x && posLeft.y <= posRight.y)
      || (posLeft.x <= posRight.x && posLeft.y > posRight.y)
    const x1 = padding
    const y1 = !inverted ? padding : height - padding
    const x2 = width / 2
    const y2 = !inverted ? padding : height - padding
    const x3 = width / 2
    const y3 = !inverted ? height - padding : padding
    const x4 = width - padding
    const y4 = !inverted ? height - padding : padding

    refPath.current.setAttribute('d', `M${x1} ${y1} C ${x2} ${y2}, ${x3} ${y3}, ${x4} ${y4}`)
  }

  // refLeft.current && console.log(refLeft.current.getBoundingClientRect())
  console.log(connKeyLeft, connKeyRight)
  return (
    <>
      <svg className={classes.svg} ref={refSVG}>
        <path ref={refPath} stroke="#fff" fill="none" id="svg_2" d="M0 0 C 50 0, 50 100, 100 100" strokeWidth="2" />
      </svg>
      <Draggable
        handle={'.handleLeft'}
        position={{ x: posLeft.x - handleSize / 2, y: posLeft.y - handleSize / 2 }}
        nodeRef={refLeft}
        onDrag={event => handleDrag(true, event)}
        onStop={event => handleDragStop(true, event)}
      >
        <div className={`${classes.handle} handleLeft`} ref={refLeft}></div>
      </Draggable>
      <Draggable
        handle={'.handleRight'}
        position={{ x: posRight.x - handleSize / 2, y: posRight.y - handleSize / 2 }}
        nodeRef={refRight}
        onDrag={event => handleDrag(false, event)}
        onStop={event => handleDragStop(false, event)}
      >
        <div className={`${classes.handle} handleRight`} ref={refRight}></div>
      </Draggable>
    </>
  )
}
