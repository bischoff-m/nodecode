import { createStyles, MantineProvider } from '@mantine/core'
import { mantineTheme, styleOverrides, classNames } from '@/styles/themeCanvas'
import {
  MouseEvent,
  WheelEvent,
  useEffect,
  useRef,
} from 'react'
import gridLines from '@/assets/grid-lines.svg'
import { directstyled, useDirectStyle } from '@/lib/direct-styled' // https://github.com/everweij/direct-styled
import { Vec2D } from '@/types/util'
import NoodleProvider from '@/components/NoodleProvider'
import { useBooleanToggle, useHotkeys } from '@mantine/hooks'
import NewNodePopup from '@/components/NewNodePopup'
import NodeProvider, { setSelectedNode } from '@/components/NodeProvider'

// Global constants and variables
const zoomFactor = 0.8
const keysPressed: string[] = [] // keys currently pressed
const prevDragPos: Vec2D = { x: 0, y: 0 } // screen position of mouse, updated while dragging
const innerOffset: Vec2D = { x: 0, y: 0 } // offset of canvas relative to its parent component in pixels, can be changed by dragging
let isDragging = false // whether the user is currently dragging

// Refs
let canvasDiv: HTMLDivElement | null = null // ref.current of the canvas component that can be dragged
let containerDiv: HTMLDivElement | null = null // ref.current of the div that contains the canvas

export const screenToCanvas = (position: Vec2D) => {
  // transforms screen coordinates to canvas coordinates (e.g. for mouse events)
  // this does not use the innerOffset and zoom variables because it would not account for animations
  if (!canvasDiv || !containerDiv) return { x: NaN, y: NaN }
  const { left, top, width: innerWidth } = canvasDiv.getBoundingClientRect()
  const { width: outerWidth } = containerDiv.getBoundingClientRect()
  return {
    x: (position.x - left) / (innerWidth / outerWidth),
    y: (position.y - top) / (innerWidth / outerWidth),
  }
}

// Zoom state (get using direct access or with callback on update)
let zoom = 1 // relative size of elements on canvas in percent
export const getCanvasZoom = () => zoom
const onZoomCallbacks: ((newZoom: number) => void)[] = [] // functions that should be called when user zoomed in/out
export const onZoomChanged = (callback: (newZoom: number) => void) => onZoomCallbacks.push(callback)

// TODO: replace vector math by something where you dont need to write x and y for each calculation
//       - https://mathjs.org/ Problem: code is less readable because of math.add(...) instead of ... + ...
//       - https://www.sweetjs.org/doc/tutorial.html Define own operators (maybe in combination with mathjs)

//////////////////////////////////////////////////////////////////////////////////////////////
// Styles
//////////////////////////////////////////////////////////////////////////////////////////////
const useStyles = createStyles((theme) => ({
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


//////////////////////////////////////////////////////////////////////////////////////////////
// Canvas component
//////////////////////////////////////////////////////////////////////////////////////////////
export default function NodeCanvas() {
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

  function updateCanvasStyle() {
    // calculate and set position of canvas and background of canvas based on
    // innerOffset, zoom and the size of the canvas container
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

  function handleMouseUp(e: MouseEvent<'div'>) {
    isDragging = false
    containerRef.current && containerRef.current.classList.remove(classes.dragging)
    containerRef.current && containerRef.current.classList.add(classes.animatedBackground)
    draggableRef.current && draggableRef.current.classList.add(classes.animatedTransition)
  }

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

  function handleWheel(e: WheelEvent<'div'>) {
    // TODO: min und max für zoom
    if (containerRef.current == null || isDragging || !keysPressed.includes('Control')) return
    e.stopPropagation()
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
