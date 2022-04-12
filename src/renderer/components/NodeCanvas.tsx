import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent, ReactElement, useEffect, useState, useRef } from 'react';
import gridSvg from '@/assets/gridSvg.svg';
import CurveConnection from '@/components/CurveConnection';
import { getNodeComponent, onNodesLoaded } from '@/components/NodeFactory';
import { directstyled, useDirectStyle } from '@/lib/direct-styled'; // https://github.com/everweij/direct-styled
import { Coord2D } from '@/types/util';


// TODO: rename origin to offset or screenOffset
//       rename originZoomed to?
//       is originZoomed even needed?
// TODO: rename Coord2D to Vec2D and ...coords to pos(ition)

const zoomDelta = 0.8;
let isDragging = false;
let prevDragPos: Coord2D = { x: 0, y: 0 };
let screenOffset: Coord2D = { x: 0, y: 0 };
let zoom = 1;
let screenSize = { width: 0, height: 0 };

export const getScreenOffset = () => screenOffset;
export const getCanvasZoom = () => zoom;
export const screenToCanvas = (coordinates: Coord2D) => ({
  x: coordinates.x - screenSize.width * (zoom - 1) / 2,
  y: coordinates.y - screenSize.height * (zoom - 1) / 2,
})
export const canvasToScreen = (coordinates: Coord2D) => ({
  x: coordinates.x + screenSize.width * (zoom - 1) / 2,
  y: coordinates.y + screenSize.height * (zoom - 1) / 2,
})

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
  },
  marker: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 10,
    height: 10,
    backgroundColor: 'red',
  },
}));

export default function NodeCanvas() {
  const classes = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();
  const [nodes, setNodes] = useState<ReactElement[]>();
  const [isLoaded, setIsLoaded] = useState(false);

  function updateCanvasStyle() {
    if (!containerRef.current)
      return
    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight
    screenSize = { width: width, height: height }

    const translatedOffset = screenToCanvas(screenOffset)
    setDragStyle({
      transform: `matrix(${zoom}, 0, 0, ${zoom}, ${screenOffset.x}, ${screenOffset.y})`,
    })
    setContainerStyle({
      backgroundPositionX: translatedOffset.x,
      backgroundPositionY: translatedOffset.y,
      backgroundSize: `${zoom * 100}px ${zoom * 100}px`,
    })
    // TODO: call update on sub components?
    // - on handle wheel event
    console.log(screenOffset, translatedOffset, zoom)
  }


  function handleMouseDown(e: ReactMouseEvent<"div">) {
    prevDragPos = { x: e.clientX, y: e.clientY }
    isDragging = e.button === 1
    isDragging && e.preventDefault()
  }

  function handleMouseMove(e: ReactMouseEvent<"div">) {
    e.preventDefault()
    if (!isDragging)
      return

    // runs when the mouse is dragged while the mouse wheel is pressed
    screenOffset.x += e.clientX - prevDragPos.x
    screenOffset.y += e.clientY - prevDragPos.y
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    updateCanvasStyle()
  }

  function handleWheel(e: ReactWheelEvent<"div">) {
    zoom *= zoomDelta ** Math.sign(e.deltaY)
    updateCanvasStyle()
  }

  useEffect(() => {
    onNodesLoaded(() => {
      setNodes([
        getNodeComponent('node1', 'input_list', { x: 40, y: 100 }),
        getNodeComponent('node2', 'output', { x: 500, y: 100 }),
      ])
      setIsLoaded(true)
      updateCanvasStyle() // remove, if you want to keep the offset and zoom of screen after refresh
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
        <div className={classes.marker}></div>
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
