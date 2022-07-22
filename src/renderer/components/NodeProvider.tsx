import { createStyles } from '@mantine/core'
import { getNodeComponent } from '@/util/nodeFactory'
import { useSelectorTyped } from '@/redux/hooks'

// TODO: merge nodeFactory and NodeProvider
// TODO: update display and state properties in Node and Field component
// TODO: fix bug where socket position deviates from node position
// TODO: transform nodes and connection properties to arrays instead of objects
//         -> or use proper keys for every node and connection

// const initNodes: NodeInstance[] = [
//   {
//     type: 'list_input',
//     display: {
//       width: 100,
//       x: 40,
//       y: 100,
//     },
//     state: {},
//   },
//   {
//     type: 'output',
//     display: {
//       width: 100,
//       x: 400,
//       y: 100,
//     },
//     state: {},
//   },
//   {
//     type: 'sql_query',
//     display: {
//       width: 100,
//       x: 400,
//       y: 240,
//     },
//     state: {},
//   },
//   {
//     type: 'sql_aggregate',
//     display: {
//       width: 100,
//       x: 400,
//       y: 520,
//     },
//     state: {},
//   },
//   {
//     type: 'sql_distinct',
//     display: {
//       width: 100,
//       x: 400,
//       y: 680,
//     },
//     state: {},
//   },
//   {
//     type: 'sql_mysql-table',
//     display: {
//       width: 100,
//       x: 40,
//       y: 380,
//     },
//     state: {},
//   },
//   {
//     type: 'sql_column-select',
//     display: {
//       width: 100,
//       x: 760,
//       y: 100,
//     },
//     state: {},
//   },
// ]


const useStyles = createStyles((theme) => ({
  container: {
    zIndex: 100,
    cursor: 'default',
  },
}))

export type NodeProviderProps = {}

export default function NodeProvider(props: NodeProviderProps) {
  const { classes } = useStyles()
  const nodes = useSelectorTyped((state) => state.program.nodes)

  return (
    <div className={classes.container}>{
      Object
        .keys(nodes)
        .map((key) => getNodeComponent(key, nodes[key].type, nodes[key].display))
    }</div>
  )
}