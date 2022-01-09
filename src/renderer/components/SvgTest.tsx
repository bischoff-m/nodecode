import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';
import { useSelectorTyped } from '@/redux/hooks';
import { Coord2D } from '@/types/util';
import { getCanvasOrigin } from '@/components/NodeCanvas';

const handleSize = 40

const useStyles = makeStyles((theme: Theme) => ({
  handle: {
    position: 'absolute',
    backgroundColor: 'red',
    width: handleSize,
    height: handleSize,
    borderRadius: handleSize / 2,
    opacity: 0,
  },
  svg: {
    position: 'absolute',
  }
}));

type SvgTestProps = {
  defaultPosLeft: Coord2D,
  defaultPosRight: Coord2D,
}

export default function SvgTest(props: SvgTestProps) {
  const classes = useStyles();
  const refLeft = useRef<HTMLDivElement>(null);
  const refRight = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [posLeft, setPosLeft] = useState<Coord2D>(props.defaultPosLeft)
  const [posRight, setPosRight] = useState<Coord2D>(props.defaultPosRight)

  const connectCoords = useSelectorTyped(state => state.connectors.coordinates)

  function updateCurve(): void {
    if (!pathRef.current || !svgRef.current)
      return

    // move svg container to top left handle position
    const minX = Math.min(posLeft.x, posRight.x)
    const minY = Math.min(posLeft.y, posRight.y)
    const padding = 4 * handleSize
    svgRef.current.setAttribute('style', `transform: translate(${minX - padding}px, ${minY - padding}px)`)

    // set width and height for svg
    const maxX = Math.max(posLeft.x, posRight.x)
    const maxY = Math.max(posLeft.y, posRight.y)
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2
    svgRef.current.setAttribute('width', `${width}px`)
    svgRef.current.setAttribute('height', `${height}px`)

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

    pathRef.current.setAttribute('d', `M${x1} ${y1} C ${x2} ${y2}, ${x3} ${y3}, ${x4} ${y4}`)
  }

  function handleDrag(
    setHandlePos: (value: React.SetStateAction<Coord2D>) => void,
    event: DraggableEvent,
  ) {
    // TODO: dont allow connection of two inputs or two outputs
    const e = event as ReactMouseEvent;
    const canvasOrigin = getCanvasOrigin();
    const mousePos = { x: e.clientX - canvasOrigin.x, y: e.clientY - canvasOrigin.y}
    const connectDistances = connectCoords.map(conn => Math.sqrt((conn.coords.x - mousePos.x) ** 2 + (conn.coords.y - mousePos.y) ** 2))
    const minDistance = Math.min(...connectDistances)

    if (minDistance <= handleSize / 2) {
      // stick to nearest connector
      setHandlePos({ ...connectCoords[connectDistances.indexOf(minDistance)].coords })
    } else {
      // stick to mouse
      setHandlePos({ x: mousePos.x, y: mousePos.y })
    }
    updateCurve()
  }

  useEffect(() => {
    updateCurve()
  }, [])

  return (
    <>
      <svg className={classes.svg} ref={svgRef}>
        <path ref={pathRef} stroke="#fff" fill="none" id="svg_2" d="M0 0 C 50 0, 50 100, 100 100" strokeWidth="2" />
      </svg>
      <Draggable
        handle={'.handleLeft'}
        position={{ x: posLeft.x - handleSize / 2, y: posLeft.y - handleSize / 2 }}
        nodeRef={refLeft}
        onDrag={event => handleDrag(setPosLeft, event)}
      >
        <div className={`${classes.handle} handleLeft`} ref={refLeft}></div>
      </Draggable>
      <Draggable
        handle={'.handleRight'}
        position={{ x: posRight.x - handleSize / 2, y: posRight.y - handleSize / 2 }}
        nodeRef={refRight}
        onDrag={event => handleDrag(setPosRight, event)}
      >
        <div className={`${classes.handle} handleRight`} ref={refRight}></div>
      </Draggable>
    </>
  )
}
