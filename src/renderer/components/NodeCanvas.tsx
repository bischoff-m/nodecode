import { Button, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactNode, MouseEvent as ReactMouseEvent, useState } from 'react';
import Node from '@/components/Node';
import { NodeCollectionSchema } from '@/types/nodeCollection';
import SelectField from '@/components/nodeComponents/SelectField';
import InputField from '@/components/nodeComponents/InputField';
import gridSvg from '@/assets/gridSvg.svg';

// https://github.com/everweij/direct-styled
import { directstyled, useDirectStyle } from '@/lib/direct-styled';
import SvgTest from './SvgTest';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    'width': '100%',
    'height': '100%',
    backgroundColor: theme.palette.background.default,
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

type NodeCanvasProps = {

}

export default function NodeCanvas(props: NodeCanvasProps) {
  const classes = useStyles();
  const [containerStyle, setContainerStyle] = useDirectStyle();
  const [dragStyle, setDragStyle] = useDirectStyle();
  const [nodeConfig, setNodeConfig] = useState<NodeCollectionSchema>();

  if (!nodeConfig) {
    window.api.invoke(
      'requestPublicFile',
      '/public/config/nodeCollections/basic_nodes.json',
      { encoding: 'utf-8' }
    ).then((data) => {
      setNodeConfig(JSON.parse(data) as NodeCollectionSchema)
    }).catch((err) => {
      throw err
    });
  }

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
        y={i * 120}
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
        y={120 * i}
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
        <SvgTest defaultX={350} defaultY={0}/>
        {content}
      </directstyled.div>
    </directstyled.div>
  )
}
