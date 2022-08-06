import { NodePackage } from '@/types/NodePackage'
import { createContext, useEffect, useState } from 'react'

export const NodePackageContext = createContext<NodePackage>({
  name: 'Empty Package',
  nodes: [],
})

type NodePackageProviderProps = {
  children?: React.ReactNode,
}

export default function NodePackageProvider(props: NodePackageProviderProps) {
  const [packageData, setPackageData] = useState<NodePackage | null>(null)

  useEffect(() => {
    window.ipc.invoke
      .getPackage()
      .then(nodePackage => setPackageData(nodePackage))
      .catch((err) => { throw err })
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