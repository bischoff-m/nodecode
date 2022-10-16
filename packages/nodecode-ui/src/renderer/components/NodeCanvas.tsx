/**
 * The `NodeCanvas` is the core component of the node editor. It contains the nodes and
 * connections of the current program. The whole canvas can be moved and zoomed. Nodes and
 * connections can be added and removed.
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
 * does not have to be re-rendered, only a CSS property has to be updated. This is done
 * in the method `updateCanvasStyle`.
 * 
 * **Note**
 * 
 * > I am not sure if using react state for the variables causes bad performance, maybe it
 * > was caused by a different problem. However, no problems occurred when directly
 * > updating the CSS properties.
 * 
 * **Another Note**
 * 
 * > There is a `<canvas></canvas>` element as a child of the `NodeCanvas` component. This
 * > is only used to draw the background grid and should not be confused with the
 * > `NodeCanvas` component. Every variable name that is named "canvas"-something DOES NOT
 * > refer to the background grid! Every variable that refers to the grid is instead
 * > named "grid"-something.
 * 
 * ### Background Grid
 * 
 * The background grid is displayed using the 2D context of the HTML
 * [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The
 * variables `innerOffset` and `zoom` are used to calculate the position of the grid.
 * The grid is updated on specific events (e.g. while dragging, zooming or resizing the
 * window) using the method `updateGrid`.
 * 
 * **Note**
 * 
 * > Currently, this approach has problems with high CPU usage while dragging. The first
 * > approach I tried was to set an SVG file that contains one tile of the grid as the
 * > `backgroundImage` of the `containerDiv` and translate/scale it using the `transform`
 * > CSS property. This also had bad, but a little better performance than the current
 * > approach. I switched to the current approach to make the grid dynamic. To improve the
 * > performance while dragging, hardware acceleration should be used for the grid
 * > calculations in the future. This could be done using
 * > [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) or the library
 * > [gpu.js](https://gpu.rocks/).
 * 
 * @module
 */

// TODO: Replace vector math by something where you dont need to write x and y for each calculation
//   - https://mathjs.org/ Problem: code is less readable because of math.add(...) instead of ... + ...
//   - https://www.sweetjs.org/doc/tutorial.html Define own operators (maybe in combination with mathjs)

import { createStyles, MantineProvider } from '@mantine/core'
import { useBooleanToggle, useHotkeys } from '@mantine/hooks'
import { MouseEvent, WheelEvent, useEffect, useRef, } from 'react'
import NewNodePopup from '@/components/NewNodePopup'
import NodeProvider, { setSelectedNode } from '@/components/NodeProvider'
import NoodleProvider from '@/components/NoodleProvider'
import { mantineTheme, styleOverrides, classNames, fixedTheme } from '@/styles/themeCanvas'
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

/**
 * Offset of canvas relative to its parent div in pixels, can be changed by dragging.
 * This does not account for zoom, the real offset has to be calculated separately.
 */
const innerOffset: Vec2D = { x: 0, y: 0 }

/** Whether the user is currently dragging. */
let isDragging = false

/** Whether the background grid is repeatedly redrawn. */
let isGridAnimated = false

/** Drawing context of the background grid element. */
let gridContext: CanvasRenderingContext2D | null = null


//////////////////////////////////////////////////////////////////////////////////////////
// Zoom state (get using direct access or with callback on update)
//////////////////////////////////////////////////////////////////////////////////////////

/** Relative size of elements on canvas in percent. */
let zoom = 1

/** A function that is called when the user zoomed in/out. */
type ZoomCallback = (newZoom: number) => void

/** Functions that should be called when user zoomed in/out. */
const onZoomCallbacks: ZoomCallback[] = []


//////////////////////////////////////////////////////////////////////////////////////////
// Functions
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * Getter for the zoom state.
 * @returns The current zoom of the canvas
 */
export function getCanvasZoom() { return zoom }

/**
 * Registers a callback that should be called whed the user zoomed in/out.
 * @event
 * @param callback - The function that should be called when zoom is triggered
 */
export function onZoomChanged(callback: ZoomCallback) { onZoomCallbacks.push(callback) }

/**
 * Transforms screen coordinates to canvas coordinates (e.g. for mouse events).
 * This does not use the innerOffset and zoom variables because it would not account for
 * animations. If this method is used before the `NodeCanvas` component is mounted, it
 * will return `NaN`.
 * @param position - Screen coordinates to convert
 * @returns Canvas coordinates after conversion
 */
export function screenToCanvas(position: Vec2D): Vec2D {
  if (!canvasDiv || !containerDiv) return { x: NaN, y: NaN }
  const { left, top, width: innerWidth } = canvasDiv.getBoundingClientRect()
  const { width: outerWidth } = containerDiv.getBoundingClientRect()
  return {
    x: (position.x - left) / (innerWidth / outerWidth),
    y: (position.y - top) / (innerWidth / outerWidth),
  }
}

/**
 * Calculate and set position of canvas and background based on innerOffset, zoom and
 * the size of the canvas container.
 */
function updateCanvasStyle() {
  if (!canvasDiv) return
  canvasDiv.style.transform = `translate(${innerOffset.x}px, ${innerOffset.y}px) scale(${zoom}, ${zoom})`
}

/**
 * Helper function to extend the modulo operator to also give positive results for
 * negative input values.
 * @param n - Dividend
 * @param m - Divisor
 * @returns The remainder left over when `n` is divided by `m`
 */
function mod(n: number, m: number) {
  return ((n % m) + m) % m
}


//////////////////////////////////////////////////////////////////////////////////////////
// Component
//////////////////////////////////////////////////////////////////////////////////////////

/** {@link https://mantine.dev/styles/create-styles/} */
const useStyles = createStyles(() => ({
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    backgroundColor: mantineTheme.other?.canvasBackgroundColor,
  },
  canvas: {
    zIndex: 100,
    width: '100%',
    height: '100%',
  },
  dragging: {
    cursor: 'grabbing',
  },
}))

/** @category Component */
export default function NodeCanvas(): JSX.Element {
  // Styles
  const { classes } = useStyles()

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLCanvasElement>(null)

  // React state
  const [isNewNodePopupOpen, toggleNewNodePopupOpen] = useBooleanToggle(false)

  // Hotkeys
  useHotkeys([
    ['space', () => toggleNewNodePopupOpen()],
  ])


  ////////////////////////////////////////////////////////////////////////////////////////
  // Event Listeners
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Enables dragging the canvas container if the wheel was pressed.
   * @param e - Mouse down event on the canvas
   */
  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    // if wheel was pressed
    isDragging = e.button === 1
    if (isDragging) {
      e.preventDefault()
      // Show the dragging cursor
      containerDiv?.classList.add(classes.dragging)
      // Start updating the background grid
      isGridAnimated = true
      window.requestAnimationFrame(updateGrid)
    }
  }

  /**
   * Disables dragging the canvas container if the wheel was released.
   */
  function handleMouseUp() {
    isDragging = false
    isGridAnimated = false
    containerDiv?.classList.remove(classes.dragging)
  }

  /**
   * Translates the canvas when it is dragged using the mouse wheel.
   * @param e - Mouse move event on the canvas
   */
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!isDragging) return

    // Runs when the mouse is dragged while the mouse wheel is pressed
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
  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    // TODO: Min and max for zoom
    if (containerDiv == null || isDragging || !keysPressed.includes('Control')) return
    e.stopPropagation()
    const { left, top, width, height } = containerDiv.getBoundingClientRect()

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

    // Update this component
    updateCanvasStyle()
    requestAnimationFrame((t) => updateGrid(t, true))

    // Updated other components that registered a callback
    onZoomCallbacks.forEach((callback) => callback(zoom))
  }


  ////////////////////////////////////////////////////////////////////////////////////////
  // Component Functions
  ////////////////////////////////////////////////////////////////////////////////////////

  /**
   * This method draws the grid to the background. It is called using the
   * `window.requestAnimationFrame()` method, which calls this method at a regular
   * interval (mostly 60 times per second).
   * 
   * The grid consists of small circles (ticks) that mark the corners of each tile defined
   * by `fixedTheme.gridSize`. Every 4th tick is a major tick that is drawn bigger and
   * brighter (all others are called minor ticks here).
   * If you zoom out, the minor ticks disappear, and if you zoom out even further, all the
   * ticks disappear. This is done for performance and clarity.
   * The appearance of the grid can be modified in {@link "renderer/styles/themeCanvas"}.
   * 
   * @param time - Current timestamp
   * @param onlyOnce - If true, only one update is done. Otherwise the background grid is
   *   repeatedly updated until `isGridAnimated` is `false`.
   */
  function updateGrid(time: number, onlyOnce?: boolean) {
    // Refs need to be defined
    if (containerDiv && canvasDiv && gridRef.current && gridContext) {
      // Get dimensions on screen (width, height, x, y)
      const gridRect = gridRef.current.getBoundingClientRect()
      const containerRect = containerDiv.getBoundingClientRect()

      // Clear whole background grid canvas
      gridContext.clearRect(0, 0, gridRect.width, gridRect.height)

      // Do not show the grid when zoomed out far enough to improve performance
      if (zoom < 0.2) return

      /**
       * The distance from the upper left corner of the outer container to the upper left
       * corner of the inner container (with accounting for zoom; needed because the
       * variable `innerOffset` does not account for zoom).
       */
      const realOffset = {
        x: innerOffset.x - (containerRect.width * (zoom - 1)) / 2,
        y: innerOffset.y - (containerRect.height * (zoom - 1)) / 2,
      }
      /** The width/height that a cell of the grid actually has on the screen. */
      const zoomedCellSize = fixedTheme.gridSize * zoom
      /** Position of the uppermost leftmost minor tick, relative to `containerDiv`. */
      const cellOffsetMinor = {
        x: mod(realOffset.x, zoomedCellSize),
        y: mod(realOffset.y, zoomedCellSize),
      }
      /** Position of the uppermost leftmost major tick, relative to `containerDiv`. */
      const cellOffsetMajor = {
        x: mod(realOffset.x, zoomedCellSize * 4),
        y: mod(realOffset.y, zoomedCellSize * 4),
      }

      /** Iterate the whole `containerDiv` and draw all minor and major ticks. */
      for (
        let x = cellOffsetMinor.x - zoomedCellSize;
        x < containerRect.width + zoomedCellSize;
        x += zoomedCellSize
      )
        for (
          let y = cellOffsetMinor.y - zoomedCellSize;
          y < containerRect.height + zoomedCellSize;
          y += zoomedCellSize
        ) {
          // Calculate if the current tick should appear bigger
          const isMajor = Math.abs(mod(x, zoomedCellSize * 4) - cellOffsetMajor.x) < 1
            && Math.abs(mod(y, zoomedCellSize * 4) - cellOffsetMajor.y) < 1

          // If zoomed out far enough, skip drawing minor ticks
          if (zoom < 0.5 && !isMajor) continue

          // Set radius and color
          const radius = isMajor
            ? fixedTheme.gridMajorRadius
            : fixedTheme.gridMinorRadius

          if (!mantineTheme.other)
            gridContext.fillStyle = 'red'
          else
            gridContext.fillStyle = isMajor
              ? mantineTheme.other.gridMajorColor
              : mantineTheme.other.gridMinorColor

          // Draw a circle for the current tick with reduced radius if zoomed out
          gridContext.beginPath()
          gridContext.arc(x, y, radius * Math.min(1, zoom ** 0.5), 0, 2 * Math.PI, false)
          gridContext.fill()
        }
    }

    // Request the next frame if the grid should still be updated
    if (!onlyOnce && isGridAnimated)
      window.requestAnimationFrame(updateGrid)
  }


  useEffect(() => {
    // Listen for keys
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

    // Update the position of the `canvasDiv`
    updateCanvasStyle()

    // Initialize the dimensions of the background grid and the drawing context
    if (gridRef.current) {
      const { width, height } = gridRef.current.getBoundingClientRect()
      gridRef.current.width = width
      gridRef.current.height = height
      gridContext = gridRef.current.getContext('2d')
    }
    // If the window is resized, also resize the background grid and update it afterwards
    const onResize = () => {
      if (!gridRef.current) return
      const { width, height } = gridRef.current.getBoundingClientRect()
      gridRef.current.width = width
      gridRef.current.height = height
      requestAnimationFrame((t) => updateGrid(t, true))
    }
    window.addEventListener('resize', onResize)

    // Start updating the background grid
    window.requestAnimationFrame(updateGrid)

    return () => {
      // Remove listeners registered above
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('resize', onResize)

      // Stop updating the background grid
      isGridAnimated = false
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
      <div
        className={classes.container}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => {
          if (e.buttons !== 4) isDragging = false
        }}
        onWheel={handleWheel}
        onClick={() => setSelectedNode(null)}
      >
        <canvas
          id='grid-background'
          className={classes.grid}
          ref={gridRef}
        ></canvas>
        <div
          className={classes.canvas}
          ref={canvasRef}
        >
          <NodeProvider />
          <NoodleProvider />
          {isNewNodePopupOpen && <NewNodePopup
            screenPosition={{ x: 750, y: 300 }}
            toggleOpen={toggleNewNodePopupOpen}
          />}
        </div>
      </div>
    </MantineProvider>
  )
}
