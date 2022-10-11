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
// Global constants and variables
//////////////////////////////////////////////////////////////////////////////////////////

/** Determines how much scrolling affects the zoom. */
const ZOOMFACTOR = 0.8

/** Keys currently pressed. */
const keysPressed: string[] = []

/** Screen position of mouse, updated while dragging. */
const prevDragPos: Vec2D = { x: 0, y: 0 }

/** Offset of canvas relative to its parent component in pixels, can be changed by dragging. */
const innerOffset: Vec2D = { x: 0, y: 0 }

/** Whether the user is currently dragging. */
let isDragging = false

// Refs
let canvasDiv: HTMLDivElement | null = null // ref.current of the canvas component that can be dragged
let containerDiv: HTMLDivElement | null = null // ref.current of the div that contains the canvas


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
  nodesContainer: {
    zIndex: 100,
    cursor: 'default',
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
  const draggableRef = useRef<HTMLDivElement>(null)

  // React state
  const [isNewNodePopupOpen, toggleNewNodePopupOpen] = useBooleanToggle(false)

  // Hotkeys
  useHotkeys([
    ['space', () => toggleNewNodePopupOpen()],
  ])

  /**
   * Calculate and set position of canvas and background based on innerOffset, zoom and
   * the size of the canvas container
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
      draggableRef.current &&
        draggableRef.current.classList.remove(classes.animatedTransition)
    }
  }

  /**
   * Disables dragging the canvas container if the wheel was released.
   */
  function handleMouseUp() {
    isDragging = false
    containerRef.current && containerRef.current.classList.remove(classes.dragging)
    containerRef.current && containerRef.current.classList.add(classes.animatedBackground)
    draggableRef.current && draggableRef.current.classList.add(classes.animatedTransition)
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

    const drag = draggableRef.current
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
    draggableRef.current && (canvasDiv = draggableRef.current)

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
          className={`${classes.draggable} ${classes.animatedTransition}`}
          ref={draggableRef}
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
