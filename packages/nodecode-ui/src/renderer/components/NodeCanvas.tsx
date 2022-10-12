/**
 * The `NodeCanvas` is the core component of the node editor. It contains the nodes and
 * connections of the current program. The whole canvas can be moved and zoomed. Nodes and
 * connections can be added and removed.
 * 
 * @module
 * 
 * @remarks
 * The outermost child of the `NodeCanvas` component is a container that stays fixed to
 * the outer contents of the app.
 * 
 * - It is referenced using the global variable `containerDiv`,
 * - It handles mouse events,
 * - It is used as a base coordinate system for mouse event coordinates,
 * - It is used for displaying the grid background.
 * 
 * Its direct child is referenced using the global variable `canvasDiv` and contains
 * nodes, connections and other node editor content. It is translated and scaled compared
 * to the `containerDiv` using the transform CSS property. Translation and scale are
 * represented by the global variables `innerOffset` and `zoom` respectively.
 * 
 * These are made global instead of using the useState react hook, because the content
 * does not have to be re-rendered, only a CSS property has to be updated.
 * The update is instead done using the library
 * [`direct-styled`](https://www.npmjs.com/package/direct-styled) which provides its own
 * HOC (`<directstyled.div>...</directstyled.div>`) and hook to update its style tag.
 * 
 * **Note**
 * 
 * > I am not sure if using react state for the variables causes bad performance, maybe it
 * > was caused by a different problem. However, no problems occurred with the 
 * > `direct-styled` library.
 * 
 * ### Background Grid
 * 
 * The background grid is displayed by using the file `grid-lines.svg` for the
 * `backgroundImage` CSS property of the container div. It is moved by repeatedly updating
 * the `backgroundPosition` and `backgroundScale` properties when the canvas div is
 * dragged or zoomed. 
 * 
 * To enable smooth zooming, a transition effect is applied using the CSS classes
 * `animatedTransition` and `animatedBackground`. This effect is disabled while dragging
 * so that the canvas snaps to the cursor.
 * 
 * **Note**
 * 
 * Currently, this approach has problems with high CPU usage while dragging. I tried the
 * following other approaches, but the CPU usage was worse.
 * - Use `radial-gradient(circle, ...)` as `backgroundImage` instead of the svg file.
 *   Additionally, dim the grid when zoomed out because it otherwise is too bright.
 *   Problem: The background needs to have the size of one tile 20px\*20px instead of the
 *   100px\*100px originally used. Also, each tile has to be translated 50% (10px) to be
 *   at the correct position. This worked fine with zoom = 1, but the grid was offset when
 *   zoomed in.
 * - Use the `<circle>` tag in the svg file instead of lines. This has the problem that
 *   the svg file is static, so i did not find a way to modify the opacity and color while
 *   the program is running.
 * - Use the library [svg.js](https://www.npmjs.com/package/svg.js) to render the grid.
 *   This also had bad performance.
 * 
 * *This may be deleted once an approach is found to display the background grid with low
 * CPU usage and dynamically (dynamic opacity and number of points/lines; fixed size of
 * individual dots/lines).*
 */

// TODO: Replace vector math by something where you dont need to write x and y for each calculation
//       - https://mathjs.org/ Problem: code is less readable because of math.add(...) instead of ... + ...
//       - https://www.sweetjs.org/doc/tutorial.html Define own operators (maybe in combination with mathjs)

import { createStyles, MantineProvider } from '@mantine/core'
import { useBooleanToggle, useHotkeys } from '@mantine/hooks'
import { MouseEvent, WheelEvent, useEffect, useRef, } from 'react'
import gridLines from '@/assets/grid-lines.svg'
import NewNodePopup from '@/components/NewNodePopup'
import NodeProvider, { setSelectedNode } from '@/components/NodeProvider'
import NoodleProvider from '@/components/NoodleProvider'
import { directstyled, useDirectStyle } from '@/lib/direct-styled' // https://github.com/everweij/direct-styled
import { mantineTheme, styleOverrides, classNames } from '@/styles/themeCanvas'
import { Vec2D } from '@/types/util'

//////////////////////////////////////////////////////////////////////////////////////////
// Refs
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * The container div (outer) and canvas div (inner) are referenced using the
 * `useRef` react hook and the variables `containerRef` and `canvasRef` respectively.
 * Once the `NodeCanvas` component is rendered, the global variables `containerDiv` and
 * `canvasDiv` are assigned the corresponding DOM elements that `containerRef` and
 * `canvasRef` refer to.
 * This allows to access properties of the DOM elements outside of the component and is
 * used to calculate coordinates based on size and position of the containers and to
 * modifiy CSS properties without react updates.
 */
/** containerRef.current of the div that contains the canvas */
let containerDiv: HTMLDivElement | null = null
/** canvasRef.current of the canvas div that can be dragged */
let canvasDiv: HTMLDivElement | null = null


//////////////////////////////////////////////////////////////////////////////////////////
// Global constants and variables
//////////////////////////////////////////////////////////////////////////////////////////

/** Determines how much scrolling affects the zoom. */
const ZOOMFACTOR = 0.8

/** Keys currently pressed. */
const keysPressed: string[] = []

/** Screen position of mouse, updated while dragging. */
const prevDragPos: Vec2D = { x: 0, y: 0 }

/** Offset of canvas relative to its parent div in pixels, can be changed by dragging. */
const innerOffset: Vec2D = { x: 0, y: 0 }

/** Whether the user is currently dragging. */
let isDragging = false


//////////////////////////////////////////////////////////////////////////////////////////
// Zoom state (get using direct access or with callback on update)
//////////////////////////////////////////////////////////////////////////////////////////

/** Relative size of elements on canvas in percent. */
let zoom = 1

/**
 * Getter for the zoom state.
 * @returns The current zoom of the canvas
 */
export const getCanvasZoom = () => zoom

/** A function that is called when the user zoomed in/out. */
type ZoomCallback = (newZoom: number) => void

/** Functions that should be called when user zoomed in/out. */
const onZoomCallbacks: ZoomCallback[] = []

/**
 * Registers a callback that should be called whed the user zoomed in/out.
 * @event
 * @param callback - The function that should be called when zoom is triggered
 */
export const onZoomChanged = (callback: ZoomCallback) => { onZoomCallbacks.push(callback) }


/**
 * Transforms screen coordinates to canvas coordinates (e.g. for mouse events).
 * This does not use the innerOffset and zoom variables because it would not account for
 * animations.
 * If this method is used before the `NodeCanvas` component is mounted, it will return
 * `NaN`.
 * @param position - Screen coordinates to convert
 * @returns Canvas coordinates after conversion
 */
export const screenToCanvas = (position: Vec2D): Vec2D => {
  if (!canvasDiv || !containerDiv) return { x: NaN, y: NaN }
  const { left, top, width: innerWidth } = canvasDiv.getBoundingClientRect()
  const { width: outerWidth } = containerDiv.getBoundingClientRect()
  return {
    x: (position.x - left) / (innerWidth / outerWidth),
    y: (position.y - top) / (innerWidth / outerWidth),
  }
}


const useStyles = createStyles(() => ({
  container: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    backgroundColor: mantineTheme.other?.canvasBackgroundColor,
    backgroundImage: `url(${gridLines})`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0px 0px',
  },
  canvas: {
    zIndex: 100,
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
}))


/**
 * @category Component
 */
export default function NodeCanvas(): JSX.Element {
  // Styles
  const { classes } = useStyles()
  const [containerStyle, setContainerStyle] = useDirectStyle()
  const [dragStyle, setDragStyle] = useDirectStyle()

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // React state
  const [isNewNodePopupOpen, toggleNewNodePopupOpen] = useBooleanToggle(false)

  // Hotkeys
  useHotkeys([
    ['space', () => toggleNewNodePopupOpen()],
  ])

  /**
   * Calculate and set position of canvas and background based on innerOffset, zoom and
   * the size of the canvas container
   * 
   * TODO: move out of the component and update directly via CSS, then maybe direct-styled
   * does not need to be used
   */
  function updateCanvasStyle() {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const translatedOffset = {
      x: innerOffset.x - (width * (zoom - 1)) / 2,
      y: innerOffset.y - (height * (zoom - 1)) / 2,
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

  /**
   * Enables dragging the canvas container if the wheel was pressed.
   * @param e - Mouse down event on the canvas
   */
  function handleMouseDown(e: MouseEvent<'div'>) {
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    // if wheel was pressed
    isDragging = e.button === 1
    if (isDragging) {
      e.preventDefault()
      containerRef.current && containerRef.current.classList.add(classes.dragging)
      containerRef.current &&
        containerRef.current.classList.remove(classes.animatedBackground)
      canvasRef.current &&
        canvasRef.current.classList.remove(classes.animatedTransition)
    }
  }

  /**
   * Disables dragging the canvas container if the wheel was released.
   */
  function handleMouseUp() {
    isDragging = false
    containerRef.current && containerRef.current.classList.remove(classes.dragging)
    containerRef.current && containerRef.current.classList.add(classes.animatedBackground)
    canvasRef.current && canvasRef.current.classList.add(classes.animatedTransition)
  }

  /**
   * Translates the canvas when it is dragged using the mouse wheel.
   * @param e - Mouse move event on the canvas
   */
  function handleMouseMove(e: MouseEvent<'div'>) {
    e.preventDefault()
    if (!isDragging) return

    // runs when the mouse is dragged while the mouse wheel is pressed
    innerOffset.x += e.clientX - prevDragPos.x
    innerOffset.y += e.clientY - prevDragPos.y
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    updateCanvasStyle()
  }

  /**
   * Zooms in/out of the canvas if the `Control` button is pressed while scrolling.
   * @param e - Mouse wheel (scroll) event on the canvas
   */
  function handleWheel(e: WheelEvent<'div'>) {
    // TODO: Min and max for zoom
    if (containerRef.current == null || isDragging || !keysPressed.includes('Control')) return
    e.stopPropagation()
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()

    // Calculations from https://stackoverflow.com/a/46833254/16953263
    // Position of cursor relative to the center point of the container
    const zoomPoint = {
      x: e.clientX - left - width / 2,
      y: e.clientY - top - height / 2,
    }
    const zoomTarget = {
      x: (zoomPoint.x - innerOffset.x) / zoom,
      y: (zoomPoint.y - innerOffset.y) / zoom,
    }
    zoom *= ZOOMFACTOR ** Math.sign(e.deltaY)

    innerOffset.x = zoomPoint.x - zoomTarget.x * zoom
    innerOffset.y = zoomPoint.y - zoomTarget.y * zoom

    const drag = canvasRef.current
    if (drag && !drag.classList.contains(classes.animatedTransition))
      drag.classList.add(classes.animatedTransition)

    // Update this component
    updateCanvasStyle()
    // Updated other components that registered a callback
    onZoomCallbacks.forEach((callback) => callback(zoom))
  }

  useEffect(() => {
    // listen for keys
    const onKeyDown = (e: KeyboardEvent) => {
      if ([
        'Control'
      ].includes(e.key) && !keysPressed.includes(e.key))
        keysPressed.push(e.key)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (keysPressed.includes(e.key))
        keysPressed.splice(keysPressed.indexOf(e.key), 1)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    // Set refs that are needed for converting between screen and canvas coordinates
    containerRef.current && (containerDiv = containerRef.current)
    canvasRef.current && (canvasDiv = canvasRef.current)

    updateCanvasStyle()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <MantineProvider
      theme={mantineTheme}
      styles={styleOverrides}
      classNames={classNames}
      withNormalizeCSS
      withGlobalStyles
      withCSSVariables
    >
      <directstyled.div
        className={`${classes.container} ${classes.animatedBackground}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => {
          if (e.buttons !== 4) isDragging = false
        }}
        onWheel={handleWheel}
        onClick={() => setSelectedNode(null)}
        style={containerStyle}
      >
        <directstyled.div
          className={`${classes.canvas} ${classes.animatedTransition}`}
          ref={canvasRef}
          style={dragStyle}
        >
          <NodeProvider />
          <NoodleProvider />
          {isNewNodePopupOpen && <NewNodePopup
            screenPosition={{ x: 760, y: 300 }}
            toggleOpen={toggleNewNodePopupOpen}
          />}
        </directstyled.div>
      </directstyled.div>
    </MantineProvider>
  )
}
