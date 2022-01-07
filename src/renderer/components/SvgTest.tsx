import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

var handlePos1 = { x: 0, y: 0 }
var handlePos2 = { x: 0, y: 0 }
const handleSize = 20

const useStyles = makeStyles((theme: Theme) => ({
  handle: {
    position: 'absolute',
    backgroundColor: 'red',
    width: handleSize,
    height: handleSize,
    borderRadius: handleSize / 2,
  },
  svg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // transform: 'translate(100px, 100px)'
  }
}));

export default function SvgTest() {
  const classes = useStyles();
  const handleRef1 = useRef<HTMLDivElement>(null);
  const handleRef2 = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  function handleDrag(event: DraggableEvent, data: DraggableData) {
    if (!pathRef.current || !handleRef1.current || !handleRef2.current)
      return

    let curPos;
    if (data.node.classList.contains('handle1')) {
      handlePos1 = { x: data.x + handleSize / 2, y: data.y + handleSize / 2 }
      curPos = handlePos1
    } else if (data.node.classList.contains('handle2')) {
      handlePos2 = { x: data.x + handleSize / 2, y: data.y + handleSize / 2 }
      curPos = handlePos2
    } else {
      return
    }
    let x1 = handlePos1.x
    let y1 = handlePos1.y
    let x2 = handlePos1.x + (handlePos2.x - handlePos1.x) / 2
    let y2 = handlePos1.y
    let x3 = handlePos2.x + (handlePos1.x - handlePos2.x) / 2
    let y3 = handlePos2.y
    let x4 = handlePos2.x
    let y4 = handlePos2.y
    pathRef.current.setAttribute('d', `M${x1} ${y1} C ${x2} ${y2}, ${x3} ${y3}, ${x4} ${y4}`)
  }

  return (
    <>
      <svg className={classes.svg}>
        <path ref={pathRef} stroke="#fff" fill="none" id="svg_2" d="M0 0 C 50 0, 50 100, 100 100" />
      </svg>
      <Draggable
        handle={'.handle1'}
        defaultPosition={{ x: handlePos1.x, y: handlePos1.y }}
        nodeRef={handleRef1}
        onDrag={handleDrag}
      >
        <div className={`${classes.handle} handle1`} ref={handleRef1}></div>
      </Draggable>
      <Draggable
        handle={'.handle2'}
        defaultPosition={{ x: handlePos2.x, y: handlePos2.y }}
        nodeRef={handleRef2}
        onDrag={handleDrag}
      >
        <div className={`${classes.handle} handle2`} ref={handleRef2}></div>
      </Draggable>
    </>
  )
}
