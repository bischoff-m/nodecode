import { createStyles } from '@mantine/core'
import { useEffect, useState } from 'react'
import { getNodeComponent, onNodesLoaded } from '@/util/nodeFactory'

// TODO: write JSON schema for nodeProgram and compile to typescript
// TODO: use nodeProgram as state instead of the actual components
// TODO: merge nodeFactory and NodeProvider

const useStyles = createStyles((theme) => ({
  container: {
    zIndex: 100,
    cursor: 'default',
  },
}))

type NodeProgram = {
  nodes: {
    [key: string]: {
      type: string
      display: {
        width: number
        x: number
        y: number
      }
      state: {
        [key: string]: any
      }
    }
  }
  connections: {
    [key: string]: {
      source: string
      target: string
    }
  }
}

export type NodeProviderProps = {}

export default function NodeProvider(props: NodeProviderProps) {
  const { classes } = useStyles()
  const [nodes, setNodes] = useState<NodeProgram['nodes']>({})

  useEffect(() => {
    onNodesLoaded(() => {
      setNodes({
        node1: {
          type: 'list_input',
          display: {
            width: 100,
            x: 40,
            y: 100,
          },
          state: {},
        },
        node2: {
          type: 'output',
          display: {
            width: 100,
            x: 400,
            y: 100,
          },
          state: {},
        },
        node3: {
          type: 'sql_query',
          display: {
            width: 100,
            x: 400,
            y: 240,
          },
          state: {},
        },
        node4: {
          type: 'sql_aggregate',
          display: {
            width: 100,
            x: 400,
            y: 520,
          },
          state: {},
        },
        node5: {
          type: 'sql_distinct',
          display: {
            width: 100,
            x: 400,
            y: 680,
          },
          state: {},
        },
        node6: {
          type: 'sql_mysql-table',
          display: {
            width: 100,
            x: 40,
            y: 380,
          },
          state: {},
        },
        node7: {
          type: 'sql_column-select',
          display: {
            width: 100,
            x: 760,
            y: 100,
          },
          state: {},
        },
      })
    })
  })

  return (
    <div className={classes.container}>{
      Object
        .keys(nodes)
        .map((key) => getNodeComponent(key, nodes[key].type, nodes[key].display))
    }</div>
  )
}