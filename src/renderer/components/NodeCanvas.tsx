import { Button, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import Node from '@/components/Node';
import { NodeCollectionSchema } from '@/types/nodeCollection';
import SelectField from '@/components/nodeComponents/SelectField';
import InputField from '@/components/nodeComponents/InputField';
import gridSvg from '@/assets/gridSvg.svg';

// https://github.com/everweij/direct-styled
import { directstyled, useDirectStyle } from '@/lib/direct-styled';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    'width': '100%',
    'height': '100%',
    backgroundColor: theme.palette.background.default,
    // backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'%239aba36\' fill-opacity=\'0.23\' fill-rule=\'nonzero\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    backgroundImage: `url(${gridSvg})`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0px 0px',
  },
  draggable: {
    'width': '100vw',
    'height': '100vh',
  }
}));

var isDragging = false;
var prevDragPos = { x: 0, y: 0 }
var canvasOrigin = { x: 0, y: 0 }
var nodeConfig: NodeCollectionSchema

window.api.invoke(
  'requestPublicFile',
  '/public/config/nodeCollections/basic_nodes.json',
  { encoding: 'utf-8' }
).then((data) => {
  nodeConfig = JSON.parse(data) as NodeCollectionSchema
}).catch((err) => {
  throw err
});

type NodeCanvasProps = {

}

export default function NodeCanvas(props: NodeCanvasProps) {
  const classes = useStyles();
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();

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

  const content = nodeConfig
    ? nodeConfig.nodes.map((item, i) =>
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
            else if (field.type === 'MultiInputLabel')
              return <InputField
                key={j}
                label='Output'
              />
            else return null
          })
        }
      </Node>
    )
    : Array(3).fill(0).map((_, i) => (
      <Node
        key={i}
        title='Test Node'
        x={0}
        y={120 * i + 30}
      ></Node>
    ))

  return (
    <directstyled.div
      className={classes.container}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => { isDragging = false }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { if (e.buttons !== 4) isDragging = false }}
      style={containerStyle}
    >
      <directstyled.div
        className={classes.draggable}
        style={dragStyle}
      >
        {content}
      </directstyled.div>
    </directstyled.div>
  )
}
