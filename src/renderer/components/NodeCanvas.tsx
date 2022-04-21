import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent, ReactElement, useEffect, useState, useRef } from 'react';
import gridSvg from '@/assets/gridSvg.svg';
import CurveConnection from '@/components/CurveConnection';
import { getNodeComponent, onNodesLoaded } from '@/components/NodeFactory';
import { directstyled, useDirectStyle } from '@/lib/direct-styled'; // https://github.com/everweij/direct-styled
import { Coord2D } from '@/types/util';

// TODO: rename Coord2D to Vec2D and ...coords to pos(ition)
// TODO: add offset in handleWheelto always zoom into the center of the screen instead of the canvas

const zoomDelta = 0.8;
let onZoomCallbacks: ((newZoom: number) => void)[] = []; // functions that should be called when user zoomed in/out
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
export const onZoomChanged = (callback: (newZoom: number) => void) => {
  onZoomCallbacks.push(callback);
}

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
    // transition: 'transform .3s',
  },
  marker: {
    position: 'absolute',
    left: 500,
    top: 300,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    zIndex: 2000,
  },
}));

export default function NodeCanvas() {
  // Styles
  const classes = useStyles();
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // React state
  const [nodes, setNodes] = useState<ReactElement[]>();
  const [isLoaded, setIsLoaded] = useState(false);

  function updateCanvasStyle() {
    if (!containerRef.current)
      return

    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight
    screenSize = { width: width, height: height }
    const translatedOffset = screenToCanvas(screenOffset)

    // TODO: remove
    // markerRef.current.style.setProperty('transform', `translate(${-screenOffset.x / zoom}px, ${-screenOffset.y / zoom}px)`)

    setDragStyle({
      transform: `translate(${screenOffset.x}px, ${screenOffset.y}px) scale(${zoom}, ${zoom})`,
    })
    setContainerStyle({
      backgroundPositionX: translatedOffset.x,
      backgroundPositionY: translatedOffset.y,
      backgroundSize: `${zoom * 100}px ${zoom * 100}px`,
    })
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
    // TODO: min und max für zoom und zoomDelta zu zoomFactor umbenennen
    // Zeige Hand beim bewegen

    // position of cursor relative to the center point of the container
    let zoomPoint = {
      x: e.clientX - screenSize.width / 2,
      y: e.clientY - screenSize.height / 2,
    }
    let zoomTarget = {
      x: (zoomPoint.x - screenOffset.x) / zoom,
      y: (zoomPoint.y - screenOffset.y) / zoom,
    }
    zoom *= zoomDelta ** Math.sign(e.deltaY)

    screenOffset.x = zoomPoint.x - zoomTarget.x * zoom
    screenOffset.y = zoomPoint.y - zoomTarget.y * zoom

    // update this component
    updateCanvasStyle()
    // updated other components that registered a callback
    onZoomCallbacks.forEach(callback => callback(zoom))
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
        {/* TODO: remove */}
        {/* <div className={classes.marker} ref={markerRef}></div> */}
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
