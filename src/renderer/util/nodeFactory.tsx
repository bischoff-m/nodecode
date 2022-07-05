import Node from '@/components/Node'
import { Arguments, NodeCollectionSchema } from '@/types/nodeCollection'

import Select from '@/components/fields/Select'
import InputOutput from '@/components/fields/InputOutput'
import List from '@/components/fields/List'

var callbacks: (() => void)[] = []
var nodeConfig: NodeCollectionSchema | null

window.ipc
  .invoke('requestPublicFile', '/public/config/nodeCollections/basic_nodes.json', {
    encoding: 'utf-8',
  })
  .then((data) => {
    nodeConfig = JSON.parse(data) as NodeCollectionSchema
    callbacks.forEach((fn) => fn())
  })
  .catch((err) => {
    throw err
  })

export function onNodesLoaded(callback: () => void): void {
  if (nodeConfig) callback()
  else callbacks.push(callback)
}

export function getNodeComponent(
  nodeKey: string,
  nodeID: string,
  position: { x: number; y: number },
): JSX.Element {
  // check if config file has been loaded
  if (!nodeConfig)
    throw Error(
      'Node configuration file is still loading. Register a callback using onNodesLoaded()',
    )

  // check if nodeID exists
  const nodeIDs = nodeConfig.nodes.map((node) => node.id)
  if (!nodeIDs.includes(nodeID)) throw Error(`NodeID \"${nodeID}\" could not be found.`)

  // build node from config
  const node = nodeConfig.nodes.find((node) => node.id === nodeID)
  if (!node) throw Error('')

  return (
    <Node
      key={nodeKey}
      nodeKey={nodeKey}
      title={node.title}
      x={position.x}
      y={position.y}
    >
      {node.fields.map((field, j) =>
        getFieldComponent(field.id, field.type, field.arguments, j, nodeKey),
      )}
    </Node>
  )
}

export function getFieldComponent(
  fieldKey: string,
  fieldType: string,
  fieldProps: Arguments,
  key: React.Key | undefined | null,
  nodeKey: string,
) {
  const allProps = { key, nodeKey, fieldKey, ...fieldProps }
  switch (fieldType) {
    case 'Select':
      return <Select {...allProps} />
    case 'InputOutput':
      return <InputOutput {...allProps} />
    case 'List':
      return <List {...allProps} />
    default:
      throw Error(`Field type "${fieldType}" could not be found.`)
  }
}
