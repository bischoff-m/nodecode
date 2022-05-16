import { createStyles, MantineProvider } from '@mantine/core';
import theme from '@/styles/theme_canvas';
import { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent, ReactElement, useEffect, useState, useRef } from 'react';
import gridSvg from '@/assets/gridSvg.svg';
import CurveConnection from '@/components/CurveConnection';
import { getNodeComponent, onNodesLoaded } from '@/components/NodeFactory';
import { directstyled, useDirectStyle } from '@/lib/direct-styled'; // https://github.com/everweij/direct-styled
import { Vec2D } from '@/types/util';

const zoomFactor = 0.8;
let onZoomCallbacks: ((newZoom: number) => void)[] = []; // functions that should be called when user zoomed in/out
let isDragging = false;
let prevDragPos: Vec2D = { x: 0, y: 0 };
let screenOffset: Vec2D = { x: 0, y: 0 };
let zoom = 1;
let screenSize = { width: 0, height: 0 };

export const getScreenOffset = () => screenOffset;
export const getCanvasZoom = () => zoom;
export const screenToCanvas = (position: Vec2D) => ({
  x: position.x - screenSize.width * (zoom - 1) / 2,
  y: position.y - screenSize.height * (zoom - 1) / 2,
})
export const canvasToScreen = (position: Vec2D) => ({
  x: position.x + screenSize.width * (zoom - 1) / 2,
  y: position.y + screenSize.height * (zoom - 1) / 2,
})
export const onZoomChanged = (callback: (newZoom: number) => void) => {
  onZoomCallbacks.push(callback);
}

// TODO: alles, was möglich ist an konkreten werten durch mantine properties ersetzen

// const useStyles = createStyles((theme) => ({
const useStyles = createStyles((theme) => ({
  container: {
    width: '100%',
    height: '100%',
    // position: 'absolute', // to stop the parent container from clipping
    backgroundColor: theme.colors.dark[7],
    backgroundImage: `url(${gridSvg})`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0px 0px',
  },
  nodesContainer: {
    position: 'absolute',
    zIndex: 100,
  },
  draggable: {
    // width: '100%',
    // height: '100%',
  },
  // marker: { // TODO: remove
  //   position: 'absolute',
  //   left: 500,
  //   top: 300,
  //   width: 10,
  //   height: 10,
  //   backgroundColor: 'red',
  //   zIndex: 2000,
  // },
  dragging: {
    cursor: 'grabbing',
  },
  animatedTransition: {
    transition: 'transform .3s',
  },
  animatedBackground: {
    transition: 'background-position .3s, background-size .3s',
  },
}));

export default function NodeCanvas() {
  // Styles
  const { classes } = useStyles();
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  // const markerRef = useRef<HTMLDivElement>(null); // TODO: remove

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
    // if wheel was pressed
    isDragging = e.button === 1
    if (isDragging) {
      e.preventDefault()
      containerRef.current && containerRef.current.classList.add(classes.dragging)
      containerRef.current && containerRef.current.classList.remove(classes.animatedBackground)
      draggableRef.current && draggableRef.current.classList.remove(classes.animatedTransition)
    }
  }

  function handleMouseUp(e: ReactMouseEvent<"div">) {
    isDragging = false
    containerRef.current && containerRef.current.classList.remove(classes.dragging)
    containerRef.current && containerRef.current.classList.add(classes.animatedBackground)
    draggableRef.current && draggableRef.current.classList.add(classes.animatedTransition)
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
    // TODO: min und max für zoom
    
    // Calculations from https://stackoverflow.com/a/46833254/16953263
    // position of cursor relative to the center point of the container
    let zoomPoint = {
      x: e.clientX - screenSize.width / 2,
      y: e.clientY - screenSize.height / 2,
    }
    let zoomTarget = {
      x: (zoomPoint.x - screenOffset.x) / zoom,
      y: (zoomPoint.y - screenOffset.y) / zoom,
    }
    zoom *= zoomFactor ** Math.sign(e.deltaY)

    screenOffset.x = zoomPoint.x - zoomTarget.x * zoom
    screenOffset.y = zoomPoint.y - zoomTarget.y * zoom

    let drag = draggableRef.current
    if (drag && !drag.classList.contains(classes.animatedTransition))
      drag.classList.add(classes.animatedTransition)

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
    <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
      <directstyled.div
        className={`${classes.container} ${classes.animatedBackground} test`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => { if (e.buttons !== 4) isDragging = false }}
        onWheel={handleWheel}
        style={containerStyle}
      >
        <directstyled.div
          className={`${classes.draggable} ${classes.animatedTransition}`}
          ref={draggableRef}
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
    </MantineProvider>
  )
}
