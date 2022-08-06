import { createStyles } from '@mantine/core'
import { NodePackageContext } from '@/components/NodePackageProvider'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import type { NodeInstance } from '@/types/NodeProgram'
import { addConnection, addNode, removeNode } from '@/redux/programSlice'
import { useContext, useEffect } from 'react'
import { useHotkeys } from '@mantine/hooks'
import type {
  Field,
  InputOutputFieldProps,
  SelectFieldProps,
  ListFieldProps,
  RadioFieldProps,
  MultiSelectFieldProps
} from '@/types/NodePackage'
import Node from '@/components/Node'
import InputOutput from '@/components/fields/InputOutput'
import Select from '@/components/fields/Select'
import List from '@/components/fields/List'
import Radio from '@/components/fields/Radio'
import MultiSelect from '@/components/fields/MultiSelect'


// TODO: update display and state properties in Node and Field component


const initNodes: NodeInstance[] = [
  // {
  //   type: 'list_input',
  //   display: {
  //     width: 100,
  //     x: 40,
  //     y: 100,
  //   },
  //   state: {},
  // },
  // {
  //   type: 'output',
  //   display: {
  //     width: 100,
  //     x: 400,
  //     y: 100,
  //   },
  //   state: {},
  // },
  // {
  //   type: 'sql_query',
  //   display: {
  //     width: 100,
  //     x: 400,
  //     y: 240,
  //   },
  //   state: {},
  // },
  // {
  //   type: 'sql_aggregate',
  //   display: {
  //     width: 100,
  //     x: 400,
  //     y: 520,
  //   },
  //   state: {},
  // },
  // {
  //   type: 'sql_distinct',
  //   display: {
  //     width: 100,
  //     x: 400,
  //     y: 680,
  //   },
  //   state: {},
  // },
  // {
  //   type: 'sql_mysql-table',
  //   display: {
  //     width: 100,
  //     x: 40,
  //     y: 380,
  //   },
  //   state: {},
  // },
  // {
  //   type: 'sql_column-select',
  //   display: {
  //     width: 100,
  //     x: 760,
  //     y: 100,
  //   },
  //   state: {},
  // },
]
let isInitialized = false


// Node selection state: getter
let selectedNode: string | null = null // key of the node that is currently selected
export const getSelectedNode = () => selectedNode
const onNodeSelectedCallbacks: ((nodeKey: string | null) => void)[] = [] // functions that should be called when user selected a node
export const onNodeSelected = (callback: (nodeKey: string | null) => void) => {
  onNodeSelectedCallbacks.push(callback)
}
// Node selection state: setter
export const setSelectedNode = (nodeKey: string | null) => {
  selectedNode = nodeKey
  onNodeSelectedCallbacks.forEach((callback) => callback(nodeKey))
}


const useStyles = createStyles((theme) => ({
  container: {
    zIndex: 100,
    cursor: 'default',
  },
}))

export type NodeProviderProps = {}

export default function NodeProvider(props: NodeProviderProps) {
  const { classes } = useStyles()
  const dispatch = useDispatchTyped()
  const nodePackage = useContext(NodePackageContext)
  const nodes = useSelectorTyped((state) => state.program.nodes)

  function getNodeComponent(
    nodeKey: string,
    nodeID: string,
    position: { x: number; y: number },
  ): JSX.Element {
    // check if nodeID exists
    const nodeIDs = nodePackage.nodes.map((node) => node.id)
    if (!nodeIDs.includes(nodeID)) throw new Error(`NodeID \"${nodeID}\" could not be found.`)

    // build node from config
    const node = nodePackage.nodes.find((node) => node.id === nodeID)
    if (!node) throw new Error('')

    return (
      <Node
        key={nodeKey}
        nodeKey={nodeKey}
        title={node.title}
        x={position.x}
        y={position.y}
      >
        {node.fields.map((field, j) => getFieldComponent(field, j, nodeKey))}
      </Node>
    )
  }

  function getFieldComponent(
    field: Field,
    key: React.Key | undefined | null,
    nodeKey: string,
  ) {
    const extraProps = {
      key,
      nodeKey,
      fieldKey: field.id
    }
    switch (field.type) {
      case 'InputOutput':
        return <InputOutput {...extraProps} {...field.props as InputOutputFieldProps} />
      case 'Select':
        return <Select {...extraProps} {...field.props as SelectFieldProps} />
      case 'List':
        return <List {...extraProps} {...field.props as ListFieldProps} />
      case 'Radio':
        return <Radio {...extraProps} {...field.props as RadioFieldProps} />
      case 'MultiSelect':
        return <MultiSelect {...extraProps} {...field.props as MultiSelectFieldProps} />
      default:
        throw new Error('Unknown field type')
    }
  }

  useHotkeys([
    ['Delete', () => {
      if (selectedNode) {
        dispatch(removeNode(selectedNode))
        setSelectedNode(null)
      }
    }]
  ])

  // uncomment this if debugging nodes should be used
  useEffect(() => {
    if (isInitialized) return
    isInitialized = true

    window.ipc.invoke
      .getProgram()
      .then((program) => {
        Object
          .keys(program.nodes)
          .forEach((nodeKey) => dispatch(addNode({
            node: program.nodes[nodeKey],
            key: nodeKey,
          })))
        Object
          .keys(program.connections)
          .forEach((connKey) => dispatch(addConnection(program.connections[connKey])))
      })
      .catch((err) => {
        console.warn('NodeProvider: Failed to load or validate program file. Loading debugging nodes.')
        if (Object.keys(nodes).length === 0)
          initNodes.forEach(node => dispatch(addNode({ node })))
        throw err
      })
  }, [])

  return (
    <div className={classes.container}>{
      Object
        .keys(nodes)
        .map((key) => getNodeComponent(key, nodes[key].type, nodes[key].display))
    }</div>
  )
}