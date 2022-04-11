import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks';
import { setOrigin, setOriginZoomed, setZoom } from '@/redux/canvasSlice';
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

const zoomDelta = 0.8
let isDragging = false;
let prevDragPos = { x: 0, y: 0 };
let screenOffset = { x: 0, y: 0 };


export function screenToCanvas(coordinates: Coord2D) {
  return { x: 42, y: 42 }
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
  const zoom = useSelectorTyped(state => state.canvas.zoom);
  const origin = useSelectorTyped(state => state.canvas.origin);
  // const originZoomed = useSelectorTyped(state => state.canvas.originZoomed);

  const dispatch = useDispatchTyped();

  function handleMouseDown(e: ReactMouseEvent<"div">) {
    prevDragPos = { x: e.clientX, y: e.clientY }
    isDragging = e.button === 1
    isDragging && e.preventDefault()
  }

  function handleMouseMove(e: ReactMouseEvent<"div">) {
    e.preventDefault()
    if (!isDragging || !containerRef.current)
      return
    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight

    // runs when the mouse is dragged while the mouse wheel is pressed
    const newOrigin = {
      x: origin.x + e.clientX - prevDragPos.x,
      y: origin.y + e.clientY - prevDragPos.y,
    }
    const newOriginZoomed = {
      x: newOrigin.x - width * (zoom - 1) / 2,
      y: newOrigin.y - height * (zoom - 1) / 2,
    }
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    dispatch(setOrigin(newOrigin))
    dispatch(setOriginZoomed(newOriginZoomed))
    setDragStyle({
      transform: `matrix(${zoom}, 0, 0, ${zoom}, ${newOrigin.x}, ${newOrigin.y})`,
    })
    setContainerStyle({
      backgroundPositionX: newOriginZoomed.x,
      backgroundPositionY: newOriginZoomed.y,
      backgroundSize: `${zoom * 100}px ${zoom * 100}px`,
    })
    console.log(newOrigin, newOriginZoomed, zoom)
  }

  function handleWheel(e: ReactWheelEvent<"div">) {
    if (!containerRef.current)
      return
    const width = containerRef.current.offsetWidth
    const height = containerRef.current.offsetHeight
    const newZoom = zoom * (zoomDelta ** Math.sign(e.deltaY))
    const newOriginZoomed = {
      x: origin.x - width * (newZoom - 1) / 2,
      y: origin.y - height * (newZoom - 1) / 2,
    }

    dispatch(setZoom(newZoom))
    dispatch(setOrigin(origin))
    dispatch(setOriginZoomed(newOriginZoomed))
    setDragStyle({
      transform: `matrix(${newZoom}, 0, 0, ${newZoom}, ${origin.x}, ${origin.y})`,
    })
    setContainerStyle({
      backgroundPositionX: newOriginZoomed.x,
      backgroundPositionY: newOriginZoomed.y,
      backgroundSize: `${newZoom * 100}px ${newZoom * 100}px`,
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
