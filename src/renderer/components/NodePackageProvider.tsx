import { createContext, useEffect, useState } from 'react'
import type { NodePackage } from '@/types/NodePackage'

export const PackageContext = createContext<NodePackage>({
  name: 'Empty Package',
  nodes: [],
})

type PackageProviderProps = {
  children?: React.ReactNode,
}

export default function PackageProvider(props: PackageProviderProps) {
  const [packageData, setPackageData] = useState<NodePackage | null>(null)

  useEffect(() => {
    window.ipc
      .invoke('requestPublicFile', '/public/config/packages/basic_nodes.json', { encoding: 'utf-8', })
      .then((data) => setPackageData(JSON.parse(data) as NodePackage))
      .catch((err) => { throw err })
  }, [])

  return (
    <>
      {packageData &&
        <PackageContext.Provider value={packageData}>
          {props.children}
        </PackageContext.Provider>
      }
    </>
  )
}