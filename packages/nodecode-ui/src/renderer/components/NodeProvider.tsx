/**
 * This component contains all nodes of the current program. The program is loaded via the
 * IPC once this component is mounted. Then all nodes and connections in the program are
 * added to the {@link "renderer/redux/programSlice".programSlice}. This also makes
 * `NoodleProvider` work. 
 * 
 * The `NodeProvider` also keeps track of which node is selected. A node can be selected
 * by clicking it and deselected by clicking the `NodeCanvas`. In the future this feature
 * should be extended to enable the selection of multiple nodes (maybe also connections).
 * The selected node is not saved as react state to prevent unnecessary re-renders.
 * 
 * **Note**
 * 
 * > I don't know if this is the right place to load the program object via the IPC. This
 * > component would work the same if the program-loading-code would be in any other file
 * > (e.g. {@link "renderer/components/NoodleProvider" NoodleProvider}). Also, the approach with 
 * > `isInitialized` to stop it from adding the nodes/connections multiple times feels
 * > off. This could likely be replaced with a separate redux action to initialize the
 * > state. However, this has to be rewritten and likely moved anyway once support for
 * > multiple program files is added.
 * 
 * @module
 */

import { createStyles } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { useContext, useEffect } from 'react'
import InputOutput from '@/components/fields/InputOutput'
import List from '@/components/fields/List'
import MultiSelect from '@/components/fields/MultiSelect'
import Radio from '@/components/fields/Radio'
import Select from '@/components/fields/Select'
import Node from '@/components/Node'
import { NodePackageContext } from '@/components/NodePackageProvider'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import { addConnection, addNode, removeNode } from '@/redux/programSlice'
import { fixedTheme } from '@/styles/themeCanvas'
import type {
  Field,
  InputOutputFieldProps,
  SelectFieldProps,
  ListFieldProps,
  RadioFieldProps,
  MultiSelectFieldProps
} from '@/types/NodePackage'


//////////////////////////////////////////////////////////////////////////////////////////
// Global constants and variables
//////////////////////////////////////////////////////////////////////////////////////////

/** Whether the current program was already loaded and added to the `programSlice`. */
let isInitialized = false

/** Key of the node that is currently selected. */
let selectedNode: string | null = null

/** Functions that should be called when the user selected a node. */
const onNodeSelectedCallbacks: ((nodeKey: string | null) => void)[] = []


//////////////////////////////////////////////////////////////////////////////////////////
// Functions
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * Getter for the node selection state.
 * @returns Key of the node that is currently selected.
 */
export function getSelectedNode() { return selectedNode }

/**
 * Setter for the node selection state.
 * @param nodeKey - The key of the new node that was selected.
 */
export function setSelectedNode(nodeKey: string | null) {
  selectedNode = nodeKey
  onNodeSelectedCallbacks.forEach((callback) => callback(nodeKey))
}

/**
 * Registers a callback that should be called when the user selected a new node.
 * @event
 * @param callback - The function that should be called when a new node is selected.
 */
export function addNodeSelectedListener(callback: (nodeKey: string | null) => void) {
  onNodeSelectedCallbacks.push(callback)
}


//////////////////////////////////////////////////////////////////////////////////////////
// Component
//////////////////////////////////////////////////////////////////////////////////////////

/** {@link https://mantine.dev/styles/create-styles/} */
const useStyles = createStyles(() => ({
  container: {
    zIndex: 100,
    cursor: 'default',
  },
}))

/** @category Component */
export default function NodeProvider(): JSX.Element {
  const { classes } = useStyles()
  const dispatch = useDispatchTyped()
  const nodePackage = useContext(NodePackageContext)
  const nodes = useSelectorTyped((state) => state.program.nodes)

  useHotkeys([
    ['Delete', () => {
      if (selectedNode) {
        dispatch(removeNode(selectedNode))
        setSelectedNode(null)
      }
    }]
  ])

  /**
   * Generates a node component according to the description given by the node packages.
   * @param nodeKey - Unique identifier that is used among others as the React key prop.
   * @param nodeID - Corresponds to the `id` field in the `NodePackage` configuration.
   * @param position - Coordinates of the new node on the node canvas.
   * @returns A new node component of the type specified by `nodeID`.
   */
  function getNodeComponent(
    nodeKey: string,
    nodeID: string,
    position: { x: number; y: number },
  ): JSX.Element {
    // Find node object in config and throw Error if does not exist
    const node = nodePackage.nodes.find((node) => node.id === nodeID)
    if (!node) throw new Error(`NodeID "${nodeID}" could not be found.`)

    // Build node from config
    return (
      <Node
        key={nodeKey}
        nodeKey={nodeKey}
        title={node.title}
        x={position.x - (position.x % fixedTheme.gridSize)}
        y={position.y - (position.y % fixedTheme.gridSize)}
      >
        {node.fields.map((field, j) => getFieldComponent(field, j, nodeKey))}
      </Node>
    )
  }

  /**
   * Generates a field component according to the description given by the node packages.
   * @param field - Information about the field given by the node packages.
   * @param key - Unique identifier that is used as the React key prop.
   * @param nodeKey - Key of the parent node used to let the field know which node it belongs to.
   * @returns A new field component of the type specified by the parameter `field`.
   */
  function getFieldComponent(
    field: Field,
    key: React.Key,
    nodeKey: string,
  ) {
    // Props to pass down to the generated field
    const extraProps = {
      key,
      nodeKey,
      fieldKey: `${field.type}.${field.id}`
    }

    // Return the corresponding component
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

  useEffect(() => {
    // Initialize only once, regardless of whether a new NodeProvider has been mounted,
    // because the `programSlice` state will stay the same.
    // 1. Possible fix: Add 'initialize' redux action and use it to overwrite the program.
    // 2. Possible fix: Clear `programSlice` state when `NodeProvider` is unmounted.
    if (isInitialized) return
    isInitialized = true

    // Load the program
    window.ipc.invoke
      .getProgram()
      .then((program) => {
        // Insert the nodes into the `programSlice` state
        Object
          .keys(program.nodes)
          .forEach((nodeKey) => dispatch(addNode({
            node: program.nodes[nodeKey],
            key: nodeKey,
          })))

        // Insert the connections into the `programSlice` state
        Object
          .keys(program.connections)
          .forEach((connKey) => dispatch(addConnection(program.connections[connKey])))
      })
      .catch((err) => {
        console.warn('NodeProvider: Failed to load program file.')
        throw err
      })
  }, [])

  return (
    <div className={classes.container}>{
      Object
        .keys(nodes)
        .map((key) => getNodeComponent(key, nodes[key].type, nodes[key].display))
    }</div>
  )
}