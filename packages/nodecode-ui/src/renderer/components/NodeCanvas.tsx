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
 * does not have to be re-rendered, only a CSS property has to be updated. This is done
 * in the method `updateCanvasStyle`.
 * 
 * **Note**
 * 
 * > I am not sure if using react state for the variables causes bad performance, maybe it
 * > was caused by a different problem. However, no problems occurred when directly
 * > updating the CSS properties.
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
 *   Problem: The background needed to have the size of one tile 25px\*25px instead of the
 *   100px\*100px originally used. Also, each tile has to be translated 50% (10px) to be
 *   at the correct position. This worked fine with zoom = 1, but the grid was offset when
 *   zoomed in.
 * - Use the `<circle>` tag in the svg file instead of lines. This has the problem that
 *   the svg file is static, so i did not find a way to modify the opacity and color while
 *   the program is running.
 * - Use the library [svg.js](https://www.npmjs.com/package/svg.js) to render the grid.
 *   This also had bad performance.
 * TODO: Try konva + gpu.js
 * 
 * *This may be deleted once an approach is found to display the background grid with low
 * CPU usage and dynamically (dynamic opacity and number of points/lines; fixed size of
 * individual dots/lines).*
 */

// TODO: Replace vector math by something where you dont need to write x and y for each calculation
//       - https://mathjs.org/ Problem: code is less readable because of math.add(...) instead of ... + ...
//       - https://www.sweetjs.org/doc/tutorial.html Define own operators (maybe in combination with mathjs)

import { createStyles, MantineProvider, useMantineTheme } from '@mantine/core'
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


const useStyles = createStyles((theme) => ({
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    backgroundColor: theme.other.canvasBackgroundColor,
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
}))


/**
 * @category Component
 */
export default function NodeCanvas(): JSX.Element {
  // Styles
  const { classes } = useStyles()
  const theme = useMantineTheme()

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

  // Variables

  /** Whether the user is currently dragging. */
  let isDragging = false

  /** Whether the background grid is repeatedly redrawn. */
  let isGridAnimated = false

  /** Drawing context of the background grid element. */
  let gridContext: CanvasRenderingContext2D | null = null

  /**
   * This method draws the grid to the background. It is called using the
   * `window.requestAnimationFrame()` method, which calls this method at a regular
   * interval (mostly 60 times per second).
   * 
   * TODO:
   * - Hide minor ticks when zooming out
   * - gridContext is set to null when a new node is added via NewNodePopup
   * - Check that nodes are inserted fitting the grid
   * - Comment everything new
   * - Remove animatedBackground documentation
   * - Add animation to grid (or remove for canvas)
   */
  function updateGrid() {
    if (containerDiv && canvasDiv && gridRef.current && gridContext) {
      if (gridContext.fillStyle !== theme.other.gridMinorColor)
        gridContext.fillStyle = theme.other.gridMinorColor
      const gridRect = gridRef.current.getBoundingClientRect()
      const containerRect = containerDiv.getBoundingClientRect()

      // The distance from the upper left corner of the outer container to the upper left
      // corner of the inner container (with accounting for zoom)
      const realOffset = {
        x: innerOffset.x - (containerRect.width * (zoom - 1)) / 2,
        y: innerOffset.y - (containerRect.height * (zoom - 1)) / 2,
      }
      const zoomedCellSize = fixedTheme.gridSize * zoom
      const cellOffsetMinor = {
        x: realOffset.x % zoomedCellSize,
        y: realOffset.y % zoomedCellSize,
      }
      const cellOffsetMajor = {
        x: realOffset.x % (zoomedCellSize * 4),
        y: realOffset.y % (zoomedCellSize * 4),
      }

      gridContext?.clearRect(0, 0, gridRect.width, gridRect.height)
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
          // TODO: Figure out how to calculate which dot is major properly
          const radius = Math.abs(x % (zoomedCellSize * 4) - cellOffsetMajor.x) < zoomedCellSize * zoom
            && Math.abs(y % (zoomedCellSize * 4) - cellOffsetMajor.y) < zoomedCellSize * zoom
            ? fixedTheme.gridMajorRadius
            : fixedTheme.gridMinorRadius
          gridContext.beginPath()
          gridContext.arc(x, y, radius, 0, 2 * Math.PI, false)
          gridContext.fill()
        }
    }
    if (isGridAnimated)
      window.requestAnimationFrame(updateGrid)
  }

  /**
   * Enables dragging the canvas container if the wheel was pressed.
   * @param e - Mouse down event on the canvas
   */
  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    // if wheel was pressed
    isDragging = e.button === 1
    console.log('down', isDragging, canvasDiv?.classList)
    if (isDragging) {
      e.preventDefault()
      containerDiv?.classList.add(classes.dragging)
      canvasDiv?.classList.remove(classes.animatedTransition)
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
    canvasDiv?.classList.add(classes.animatedTransition)
    updateCanvasStyle()
    requestAnimationFrame(updateGrid)

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

    if (gridRef.current) {
      const { width, height } = gridRef.current.getBoundingClientRect()
      gridRef.current.width = width
      gridRef.current.height = height
      gridContext = gridRef.current.getContext('2d')
    }
    window.requestAnimationFrame(updateGrid)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
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
            screenPosition={{ x: 760, y: 300 }}
            toggleOpen={toggleNewNodePopupOpen}
          />}
        </div>
      </div>
    </MantineProvider>
  )
}
