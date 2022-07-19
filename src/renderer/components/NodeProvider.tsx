import { createStyles } from '@mantine/core'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import { getNodeComponent, onNodesLoaded } from '@/util/nodeFactory'

const useStyles = createStyles((theme) => ({
  container: {
    zIndex: 100,
    cursor: 'default',
  },
}))

export type NodeProviderProps = {

}

export default function NodeProvider(props: NodeProviderProps) {
  const { classes } = useStyles()
  // const [program, setProgram] = useState<string>()
  const [nodes, setNodes] = useState<ReactElement[]>()

  useEffect(() => {
    onNodesLoaded(() => {
      setNodes([
        getNodeComponent('node1', 'input_list', { x: 40, y: 100 }),
        // getNodeComponent('node6', 'sql_mysql-table', { x: 40, y: 380 }),
        getNodeComponent('node7', 'sql_column-select', { x: 760, y: 100 }),
        // getNodeComponent('node2', 'output', { x: 400, y: 100 }),
        // getNodeComponent('node3', 'sql_query', { x: 400, y: 240 }),
        // getNodeComponent('node4', 'sql_aggregate', { x: 400, y: 520 }),
        // getNodeComponent('node5', 'sql_distinct', { x: 400, y: 680 }),
      ])
    })
  }, [])

  return (
    <div className={classes.container}>{
      nodes
    }</div>
  )
}