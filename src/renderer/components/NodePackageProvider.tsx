import { createContext, useEffect, useState } from 'react'
import Ajv from 'ajv'
import type {
  Field,
  NodePackage,
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


export function getNodeComponent(
  nodePackage: NodePackage,
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

export const NodePackageContext = createContext<NodePackage>({
  name: 'Empty Package',
  nodes: [],
})

type NodePackageProviderProps = {
  children?: React.ReactNode,
}

export default function NodePackageProvider(props: NodePackageProviderProps) {
  const [packageData, setPackageData] = useState<NodePackage | null>(null)
  let ajv = new Ajv({ allErrors: true })

  useEffect(() => {
    // TODO: Improve error handling by showing message to user
    window.ipc.invoke
      .getPackageSchema()
      .then(async ({ schema, dependencies }) => {
        dependencies.forEach(dep => {
          if (!dep.$id)
            throw new Error(`The $id property is required for all JSON schemas. ${JSON.stringify(dep)}`)
          !ajv.getSchema(dep.$id) && ajv.addSchema(dep, dep.$id)
        })
        return ajv.compile(schema)
      })
      .then((validate) => window.ipc.invoke
        .getPackage()
        .then((nodePackage) => {
          if (!validate(nodePackage))
            throw new Error(`The package is not valid. ${JSON.stringify(validate.errors)}`)
          setPackageData(nodePackage)
        }))
      .catch((err) => { throw err })

    return () => {
      ajv = new Ajv({ allErrors: true })
    }
  }, [])

  return (
    <>
      {packageData &&
        <NodePackageContext.Provider value={packageData}>
          {props.children}
        </NodePackageContext.Provider>
      }
    </>
  )
}