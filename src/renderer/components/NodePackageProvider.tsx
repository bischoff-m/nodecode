import { createContext, useEffect, useState } from 'react'
import type { NodePackage } from '@/types/NodePackage'
import Ajv from 'ajv'

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