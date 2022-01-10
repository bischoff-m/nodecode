import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { MouseEvent as ReactMouseEvent, ReactElement, useEffect, useState } from 'react';
import gridSvg from '@/assets/gridSvg.svg';
import SvgTest from '@/components/SvgTest';
import { getNodeComponent, onNodesLoaded } from '@/components/NodeFactory';
import { directstyled, useDirectStyle } from '@/lib/direct-styled'; // https://github.com/everweij/direct-styled


let isDragging = false;
let prevDragPos = { x: 0, y: 0 }
let canvasOrigin = { x: 0, y: 0 }

export const getCanvasOrigin = () => canvasOrigin

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
  draggable: {
    width: '100vw',
    height: '100vh',
  }
}));

export default function NodeCanvas() {
  const classes = useStyles();
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();
  const [nodes, setNodes] = useState<ReactElement[]>();
  const [isLoaded, setIsLoaded] = useState(false);

  function handleMouseDown(e: ReactMouseEvent<"div", MouseEvent>) {
    isDragging = e.button === 1
    prevDragPos = { x: e.clientX, y: e.clientY }
  }

  function handleMouseMove(e: ReactMouseEvent<"div", MouseEvent>) {
    e.preventDefault()
    if (!isDragging)
      return
    canvasOrigin.x += e.clientX - prevDragPos.x
    canvasOrigin.y += e.clientY - prevDragPos.y
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    setDragStyle({
      transform: `matrix(1, 0, 0, 1, ${canvasOrigin.x}, ${canvasOrigin.y})`,
    })
    setContainerStyle({
      backgroundPositionX: canvasOrigin.x,
      backgroundPositionY: canvasOrigin.y,
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
      onMouseDown={handleMouseDown}
      onMouseUp={() => { isDragging = false }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { if (e.buttons !== 4) isDragging = false }}
      style={containerStyle}
    >
      <directstyled.div
        className={classes.draggable}
        style={dragStyle}
      >
        {nodes}
        {isLoaded && <SvgTest defaultConnKeyLeft='node1.output.right' defaultConnKeyRight='node2.input.left' key={0} />}
      </directstyled.div>
    </directstyled.div>
  )
}
