import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useSelectorTyped } from '@/redux/hooks';

const handleSize = 20

const useStyles = makeStyles((theme: Theme) => ({
  handle: {
    position: 'absolute',
    backgroundColor: 'red',
    width: handleSize,
    height: handleSize,
    borderRadius: handleSize / 2,
    opacity: 1,
  },
  svg: {
    position: 'absolute',
  }
}));

type SvgTestProps = {
  defaultX: number,
  defaultY: number,
}

export default function SvgTest(props: SvgTestProps) {
  const classes = useStyles();
  const handleRef1 = useRef<HTMLDivElement>(null);
  const handleRef2 = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const connectCoords = useSelectorTyped(state => state.connectors.coordinates)

  var handlePos1 = { x: props.defaultX, y: props.defaultY }
  var handlePos2 = { x: props.defaultX + 100, y: props.defaultY + 100 }

  function moveHandle(): void {
    if (!pathRef.current || !svgRef.current)
      return

    // set x and y for svg
    const minX = Math.min(handlePos1.x, handlePos2.x)
    const minY = Math.min(handlePos1.y, handlePos2.y)
    svgRef.current.setAttribute('style', `transform: translate(${minX - handleSize / 2}px, ${minY - handleSize / 2}px)`)

    // set width and height for svg
    const maxX = Math.max(handlePos1.x, handlePos2.x)
    const maxY = Math.max(handlePos1.y, handlePos2.y)
    const width = maxX - minX + handleSize
    const height = maxY - minY + handleSize
    svgRef.current.setAttribute('width', `${width}px`)
    svgRef.current.setAttribute('height', `${height}px`)

    // update path https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    const inverted = (handlePos1.x > handlePos2.x && handlePos1.y <= handlePos2.y)
      || (handlePos1.x <= handlePos2.x && handlePos1.y > handlePos2.y)
    const x1 = handleSize / 2
    const y1 = !inverted ? handleSize / 2 : height - handleSize / 2
    const x2 = width / 2
    const y2 = !inverted ? handleSize / 2 : height - handleSize / 2
    const x3 = width / 2
    const y3 = !inverted ? height - handleSize / 2 : handleSize / 2
    const x4 = width - handleSize / 2
    const y4 = !inverted ? height - handleSize / 2 : handleSize / 2

    pathRef.current.setAttribute('d', `M${x1} ${y1} C ${x2} ${y2}, ${x3} ${y3}, ${x4} ${y4}`)
  }

  function handleDrag(event: DraggableEvent, data: DraggableData) {
    // update handle position based on event and move handle
    if (data.node.classList.contains('handle1'))
      handlePos1 = { x: data.x + handleSize / 2, y: data.y + handleSize / 2 }
    else if (data.node.classList.contains('handle2'))
      handlePos2 = { x: data.x + handleSize / 2, y: data.y + handleSize / 2 }

    moveHandle()
  }

  useEffect(() => {
    moveHandle()
  }, [])

  return (
    <>
      <svg className={classes.svg} ref={svgRef}>
        <path ref={pathRef} stroke="#fff" fill="none" id="svg_2" d="M0 0 C 50 0, 50 100, 100 100" strokeWidth="2" />
      </svg>
      <Draggable
        handle={'.handle1'}
        defaultPosition={{ x: handlePos1.x - handleSize / 2, y: handlePos1.y - handleSize / 2 }}
        nodeRef={handleRef1}
        onDrag={handleDrag}
      >
        <div className={`${classes.handle} handle1`} ref={handleRef1}></div>
      </Draggable>
      <Draggable
        handle={'.handle2'}
        defaultPosition={{ x: handlePos2.x - handleSize / 2, y: handlePos2.y - handleSize / 2 }}
        nodeRef={handleRef2}
        onDrag={handleDrag}
      >
        <div className={`${classes.handle} handle2`} ref={handleRef2}></div>
      </Draggable>
      {/* <div>{canvasOrigin.x} {canvasOrigin.y}</div> */}
    </>
  )
}
