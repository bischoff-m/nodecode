import Node from '@/components/Node'
import type {
  Field,
  NodePackage,
  InputOutputFieldProps,
  SelectFieldProps,
  ListFieldProps,
  RadioFieldProps,
  MultiSelectFieldProps
} from '@/types/NodePackage'

import InputOutput from '@/components/fields/InputOutput'
import Select from '@/components/fields/Select'
import List from '@/components/fields/List'
import Radio from '@/components/fields/Radio'
import MultiSelect from '@/components/fields/MultiSelect'

var callbacks: ((nodePackage: NodePackage) => void)[] = []
var nodePackage: NodePackage | null

window.ipc
  .invoke('requestPublicFile', '/public/config/packages/basic_nodes.json', { encoding: 'utf-8', })
  .then((data) => {
    nodePackage = JSON.parse(data) as NodePackage
    callbacks.forEach((fn) => nodePackage && fn(nodePackage))
  })
  .catch((err) => { throw err })

export function onNodesLoaded(callback: (nodePackage: NodePackage) => void): void {
  if (nodePackage) callback(nodePackage)
  else callbacks.push(callback)
}

export function getNodeComponent(
  nodeKey: string,
  nodeID: string,
  position: { x: number; y: number },
): JSX.Element {
  // check if config file has been loaded
  if (!nodePackage)
    throw new Error('Node configuration file is still loading. Register a callback using onNodesLoaded()')

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

export function getFieldComponent(
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
