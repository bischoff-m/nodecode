import type { NodeProps } from '@/components/Node';
import Node from '@/components/Node';
import SelectField from '@/components/nodeComponents/SelectField';
import InputField from '@/components/nodeComponents/InputField';
import { Arguments, NodeCollectionSchema } from '@/types/nodeCollection';

var callbacks: (() => void)[] = [];
var nodeConfig: NodeCollectionSchema | null;

window.api.invoke(
  'requestPublicFile',
  '/public/config/nodeCollections/basic_nodes.json',
  { encoding: 'utf-8' }
).then((data) => {
  nodeConfig = JSON.parse(data) as NodeCollectionSchema
  callbacks.forEach((fn) => fn());
}).catch((err) => {
  throw err
});

export function onNodesLoaded(callback: () => void): void {
  if (nodeConfig)
    callback()
  else
    callbacks.push(callback);
}

export function getNodeComponent(
  nodeID: string,
  position: { x: number, y: number },
  key: React.Key | undefined | null,
): JSX.Element {
  // check if config file has been loaded
  if (!nodeConfig)
    throw Error('Node configuration file is still loading. Register a callback using onNodesLoaded()')

  // check if nodeID exists
  const nodeIDs = nodeConfig.nodes.map(node => node.id)
  if (!nodeIDs.includes(nodeID))
    throw Error(`NodeID \"${nodeID}\" could not be found.`)

  // build node from config
  const node = nodeConfig.nodes.find(node => node.id === nodeID)
  if (!node) throw Error('')

  return <Node
    title={node.title}
    x={position.x}
    y={position.y}
    key={key}
  >
    {
      node.fields.map((field, j) => getFieldComponent(
        field.type,
        field.arguments,
        j,
      ))
    }
  </Node>
}

export function getFieldComponent(
  fieldType: string,
  fieldProps: Arguments,
  key: React.Key | undefined | null,
) {
  switch (fieldType) {
    case 'Dropdown':
      return <SelectField
        label='Datatype'
        key={key}
        {...fieldProps}
      />
    case 'MultiInputLabel':
      return <InputField
        label='Output'
        key={key}
        {...fieldProps}
      />
    default:
      return null
      // TODO: throw Error
      // return <div>Not implemented yet.</div>
      // throw Error(`Field type \"${fieldType}\" could not be found.`)
  }
}