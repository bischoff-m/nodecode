import { createStyles } from '@mantine/core'
import { useEffect } from 'react'
import { getNodeComponent, onNodesLoaded } from '@/util/nodeFactory'
import { NodeInstance } from '@/types/NodeProgram'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import { addNode } from '@/redux/programSlice'

// TODO: write JSON schema for nodeProgram and compile to typescript
// TODO: use nodeProgram as state instead of the actual components
// TODO: merge nodeFactory and NodeProvider

const initNodes: NodeInstance[] = [
  {
    type: 'list_input',
    display: {
      width: 100,
      x: 40,
      y: 100,
    },
    state: {},
  },
  {
    type: 'output',
    display: {
      width: 100,
      x: 400,
      y: 100,
    },
    state: {},
  },
  {
    type: 'sql_query',
    display: {
      width: 100,
      x: 400,
      y: 240,
    },
    state: {},
  },
  {
    type: 'sql_aggregate',
    display: {
      width: 100,
      x: 400,
      y: 520,
    },
    state: {},
  },
  {
    type: 'sql_distinct',
    display: {
      width: 100,
      x: 400,
      y: 680,
    },
    state: {},
  },
  {
    type: 'sql_mysql-table',
    display: {
      width: 100,
      x: 40,
      y: 380,
    },
    state: {},
  },
  {
    type: 'sql_column-select',
    display: {
      width: 100,
      x: 760,
      y: 100,
    },
    state: {},
  },
]


const useStyles = createStyles((theme) => ({
  container: {
    zIndex: 100,
    cursor: 'default',
  },
}))

export type NodeProviderProps = {}

export default function NodeProvider(props: NodeProviderProps) {
  const { classes } = useStyles()
  // const [nodes, setNodes] = useState<NodeProgram['nodes']>({})
  const nodes = useSelectorTyped((state) => state.program.nodes)
  const dispatch = useDispatchTyped()

  useEffect(() => {
    onNodesLoaded(() => initNodes.map(node => dispatch(addNode(node))))
  }, [])

  return (
    <div className={classes.container}>{
      Object
        .keys(nodes)
        .map((key) => getNodeComponent(key, nodes[key].type, nodes[key].display))
    }</div>
  )
}