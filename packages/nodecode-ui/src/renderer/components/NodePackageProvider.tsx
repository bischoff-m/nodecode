/**
 * This component contains the {@link "renderer/types/NodePackage".NodePackage} context of
 * the app which represents all the nodes that can be placed in the editor or that a loaded
 * program can consist of. It contains a description of what the nodes look like and what 
 * fields they consist of and is loaded via the IPC when the program starts.
 * 
 * The `NodePackageProvider` component needs to wrap all other components that want to
 * access the context. It is made available to the subcomponents via the
 * [`useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext) react hook
 * and the {@link NodePackageContext} variable.
 * 
 * **Note**
 * 
 * > Currently, the context is only reloaded when the app is restarted or `Ctrl + R` is
 * > pressed in development mode. In the future, the user should be able to install node
 * > packages consisting of nodes for a specific use case (e.g., creating SQL queries or
 * > image processing) by using a plugin browser in the app. When installing a new node
 * > package, the NodePackage context would need to be updated and the
 * > {@link "renderer/components/NodeCanvas" NodeCanvas} would need to be reloaded.
 * 
 * > A further extension would be to provide a node builder tool to create new nodes and
 * > node packages without having to manually modify the corresponding JSON file.
 * 
 * @module
 */

import { createContext, useEffect, useState } from 'react'
import { NodePackage } from '@/types/NodePackage'

/**
 * The NodePackage context that is passed down to the child components. It is initialized
 * with an empty array. Once the component is mounted, the node package data is loaded
 * via the IPC and set as the context data. Only then the children of this component are
 * rendered.
 */
export const NodePackageContext = createContext<NodePackage>({
  name: 'Empty Package',
  nodes: [],
})


/** @category Component */
export type NodePackageProviderProps = {
  /** The child elements that need to access the NodePackage context. */
  children?: React.ReactNode,
}

/** @category Component */
export default function NodePackageProvider(props: NodePackageProviderProps): JSX.Element {
  /** Stores all the node package data that is used as the context once loaded. */
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