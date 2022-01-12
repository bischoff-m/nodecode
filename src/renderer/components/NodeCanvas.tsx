import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent, ReactElement, useEffect, useState, useRef } from 'react';
import gridSvg from '@/assets/gridSvg.svg';
import CurveConnection from '@/components/CurveConnection';
import { getNodeComponent, onNodesLoaded } from '@/components/NodeFactory';
import { directstyled, useDirectStyle } from '@/lib/direct-styled'; // https://github.com/everweij/direct-styled


const zoomDelta = 0.8
let isDragging = false;
let prevDragPos = { x: 0, y: 0 };
let canvasOrigin = { x: 0, y: 0 };
let canvasOriginWithZoom = { x: 0, y: 0 };
let zoom = 1;

export const getCanvasOrigin = () => canvasOrigin
export const getZoom = () => zoom

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute', // to stop the parent container from clipping
    backgroundColor: theme.palette.background.default,
    backgroundImage: `url(${gridSvg})`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0px 0px',
  },
  nodesContainer: {
    position: 'absolute',
    zIndex: 100,
  },
  draggable: {
    width: '100vw',
    height: '100vh',
  }
}));

export default function NodeCanvas() {
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();
  const [nodes, setNodes] = useState<ReactElement[]>();
  const [isLoaded, setIsLoaded] = useState(false);
  // const [zoom, setZoom] = useState(1);

  function handleMouseDown(e: ReactMouseEvent<"div">) {
    prevDragPos = { x: e.clientX, y: e.clientY }
    isDragging = e.button === 1
    isDragging && e.preventDefault()
  }

  function handleMouseMove(e: ReactMouseEvent<"div">) {
    e.preventDefault()
    if (!isDragging)
      return
    canvasOrigin.x += e.clientX - prevDragPos.x
    canvasOrigin.y += e.clientY - prevDragPos.y
    canvasOriginWithZoom.x += e.clientX - prevDragPos.x
    canvasOriginWithZoom.y += e.clientY - prevDragPos.y
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    setDragStyle({
      transform: `matrix(${zoom}, 0, 0, ${zoom}, ${canvasOrigin.x}, ${canvasOrigin.y})`,
    })
    setContainerStyle({
      backgroundPositionX: canvasOriginWithZoom.x,
      backgroundPositionY: canvasOriginWithZoom.y,
      backgroundSize: `${zoom * 100}px ${zoom * 100}px`,
    })
  }

  function handleWheel(e: ReactWheelEvent<"div">) {
    if (!containerRef.current)
      return
    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight

    const zoomBy = zoomDelta ** Math.sign(e.deltaY)
    zoom *= zoomBy
    canvasOriginWithZoom.x = canvasOrigin.x + (width - width * zoom) / 2
    canvasOriginWithZoom.y = canvasOrigin.y + (height - height * zoom) / 2
    setDragStyle({
      transform: `matrix(${zoom}, 0, 0, ${zoom}, ${canvasOrigin.x}, ${canvasOrigin.y})`,
    })
    setContainerStyle({
      backgroundPositionX: canvasOriginWithZoom.x,
      backgroundPositionY: canvasOriginWithZoom.y,
      backgroundSize: `${zoom * 100}px ${zoom * 100}px`,
    })
  }

  useEffect(() => {
    onNodesLoaded(() => {
      setNodes([
        getNodeComponent('node1', 'input_list', { x: 40, y: 100 }),
        getNodeComponent('node2', 'output', { x: 500, y: 100 }),
      ])
      setIsLoaded(true)
      // setNodes(Array(1).fill(0).map((_, i) => getNodeComponent('node' + i, 'input_list', { x: 40, y: 100 })))
    })
  }, [])

  return (
    <directstyled.div
      className={classes.container}
      ref={containerRef}
      onMouseUp={() => { isDragging = false }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { if (e.buttons !== 4) isDragging = false }}
      onWheel={handleWheel}
      style={containerStyle}
    >
      <directstyled.div
        className={classes.draggable}
        style={dragStyle}
      >
        <div className={classes.nodesContainer}>
          {nodes}
        </div>
        {
          isLoaded &&
          <CurveConnection
            defaultConnKeyLeft='node1.output.right'
            defaultConnKeyRight='node2.input.left'
            key={0}
            curveID='0'
          />
        }
      </directstyled.div>
    </directstyled.div>
  )
}
