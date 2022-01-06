import { Button, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, MouseEvent } from 'react';
import Node from '@/components/Node';
import { NodeCollectionSchema } from '@/types/nodeCollection';

// https://github.com/everweij/direct-styled
import { directstyled, useDirectStyle } from '@/lib/direct-styled';
import SelectField from './nodeComponents/SelectField';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    'width': '100%',
    'height': '100%',
    backgroundColor: theme.palette.background.default,
  },
  draggable: {
    'width': '100vw',
    'height': '100vh',
  }
}));

var isDragging = false;
var prevDragPos = { x: 0, y: 0 }
var canvasOrigin = { x: 0, y: 0 }

type NodeCanvasProps = {
  children?: ReactNode
}
// const nodeConfig = await import('public/config/nodeCollections/basic_nodes.json') as NodeCollectionSchema

export default function NodeCanvas(props: NodeCanvasProps) {
  const classes = useStyles();
  const [style, setStyle] = useDirectStyle();

  function handleMouseDown(e: MouseEvent) {
    isDragging = e.button === 1
    prevDragPos = { x: e.clientX, y: e.clientY }
  }

  function handleMouseMove(e: MouseEvent) {
    e.preventDefault()
    if (!isDragging)
      return
    canvasOrigin.x += e.clientX - prevDragPos.x
    canvasOrigin.y += e.clientY - prevDragPos.y
    prevDragPos.x = e.clientX
    prevDragPos.y = e.clientY
    setStyle({
      transform: `matrix(1, 0, 0, 1, ${canvasOrigin.x}, ${canvasOrigin.y})`,
    })
  }

  return (
    <div
      className={classes.container}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => { isDragging = false }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { if (e.buttons !== 4) isDragging = false }}
    >
      <directstyled.div
        className={classes.draggable}
        style={style}
      >
        {props.children}
        {
          Array(3).fill(0).map((_, i) => (
            <Node
              key={i}
              title='Test Node'
              x={0}
              y={120 * i + 30}
            ></Node>
          ))
        }
        {/* {
          nodeConfig.items.map((item, i) =>
            <Node
              key={i}
              title={item.title}
              x={0}
              y={i * 200}
            >
              {
                item.fields.map((field, j) => {
                  if (field.type === 'Dropdown')
                    return <SelectField
                      key={j}
                      values={field.arguments.values}
                      default={field.arguments.default}
                      label='Datatype'
                    />
                  else return null
                })
              }
            </Node>
          )
        } */}
      </directstyled.div>
    </div>
  )
}
