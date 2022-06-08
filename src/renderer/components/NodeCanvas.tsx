import { createStyles, MantineProvider } from '@mantine/core';
import { theme, styleOverrides } from '@/styles/theme_canvas';
import { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent, ReactElement, useEffect, useState, useRef } from 'react';
import gridSvg from '@/assets/gridSvg.svg';
import Noodle from '@/components/Noodle';
import { getNodeComponent, onNodesLoaded } from '@/components/NodeFactory';
import { directstyled, useDirectStyle } from '@/lib/direct-styled'; // https://github.com/everweij/direct-styled
import { Vec2D } from '@/types/util';

const zoomFactor = 0.8;
let onZoomCallbacks: ((newZoom: number) => void)[] = []; // functions that should be called when user zoomed in/out
let isDragging = false; // whether the user is currently dragging
let prevDragPos: Vec2D = { x: 0, y: 0 }; // screen position of mouse, updated while dragging
let innerOffset: Vec2D = { x: 0, y: 0 }; // offset of canvas relative to its parent component in pixels, can be changed by dragging
let zoom = 1; // relative size of elements on canvas in percent

let canvasDiv: HTMLDivElement | null = null; // ref.current of the canvas component that can be dragged
let containerDiv: HTMLDivElement | null = null; // ref.current of the div that contains the canvas

export const getCanvasZoom = () => zoom;
export const screenToCanvas = (position: Vec2D) => {
  if (!canvasDiv || !containerDiv)
    return { x: NaN, y: NaN }
  const { left, top, width: innerWidth } = canvasDiv.getBoundingClientRect()
  const { width: outerWidth } = containerDiv.getBoundingClientRect()
  return {
    x: (position.x - left) / (innerWidth / outerWidth),
    y: (position.y - top) / (innerWidth / outerWidth),
  }
}
export const onZoomChanged = (callback: (newZoom: number) => void) => {
  onZoomCallbacks.push(callback);
}

// TODO: alles, was möglich ist an konkreten werten durch mantine properties ersetzen
// TODO: replace vector math by something where you dont need to write x and y for each calculation
//       - https://mathjs.org/ Problem: code is less readable because of math.add(...) instead of ... + ...
//       - https://www.sweetjs.org/doc/tutorial.html Define own operators (maybe in combination with mathjs)

const useStyles = createStyles((theme) => ({
  container: {
    width: '100%',
    height: '100%',
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
    width: '100%',
    height: '100%',
  },
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

  // React state
  const [nodes, setNodes] = useState<ReactElement[]>();
  const [isLoaded, setIsLoaded] = useState(false);

  function updateCanvasStyle() {
    // calculate and set position of canvas and background of canvas based on
    // innerOffset, zoom and the size of the canvas container
    if (!containerRef.current)
      return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const translatedOffset = {
      x: innerOffset.x - width * (zoom - 1) / 2,
      y: innerOffset.y - height * (zoom - 1) / 2,
    }

    setDragStyle({
      transform: `translate(${innerOffset.x}px, ${innerOffset.y}px) scale(${zoom}, ${zoom})`,
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
    innerOffset.x += e.clientX - prevDragPos.x
    innerOffset.y += e.clientY - prevDragPos.y
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    updateCanvasStyle()
  }

  function handleWheel(e: ReactWheelEvent<"div">) {
    // TODO: min und max für zoom
    if (containerRef.current == null) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    
    // Calculations from https://stackoverflow.com/a/46833254/16953263
    // position of cursor relative to the center point of the container
    let zoomPoint = {
      x: e.clientX - left - width / 2,
      y: e.clientY - top - height / 2,
    }
    let zoomTarget = {
      x: (zoomPoint.x - innerOffset.x) / zoom,
      y: (zoomPoint.y - innerOffset.y) / zoom,
    }
    zoom *= zoomFactor ** Math.sign(e.deltaY)

    innerOffset.x = zoomPoint.x - zoomTarget.x * zoom
    innerOffset.y = zoomPoint.y - zoomTarget.y * zoom

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
      updateCanvasStyle()
      // setNodes(Array(1).fill(0).map((_, i) => getNodeComponent('node' + i, 'input_list', { x: 40, y: 100 })))
    })
  }, [])

  containerRef.current && (containerDiv = containerRef.current)
  draggableRef.current && (canvasDiv = draggableRef.current)
  return (
    <MantineProvider theme={theme} styles={styleOverrides} withNormalizeCSS withGlobalStyles>
      <directstyled.div
        className={`${classes.container} ${classes.animatedBackground}`}
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
          {
            isLoaded &&
            <>
              <div className={classes.nodesContainer}>
                {nodes}
              </div>
              <Noodle
                defaultSocketKeyLeft='node1.output.right'
                defaultSocketKeyRight='node2.input.left'
                key={0}
                noodleID='0'
              />
            </>
          }
        </directstyled.div>
      </directstyled.div>
    </MantineProvider>
  )
}
