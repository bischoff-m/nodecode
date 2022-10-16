/**
 * This component contains all noodles of the current program. Noodles that are connected
 * on both ends (i.e. have a source and a target socket) are called connections. They can
 * be moved or disconnected by dragging the right handle.
 * 
 * To create new connections, the user can drag from any output socket or from an empty
 * input socket and a new noodle will appear. To make this possible, noodles, where either
 * only the source or the target key is specified, are added to every output socket and
 * every empty input socket. These noodles are called *collapsed* or *loose* and are
 * stored in this component with the `useState` React hook. Connections, on the other
 * hand, are stored in the `programSlice` using Redux.
 * 
 * The main update function is called `handleSocketUpdate`. It is passed to the noodles as
 * a prop and called by them when the source or target of a noodle changes. This means 
 * that the noodles themselves do not affect any non-internal state, bbut leave that to
 * this component. To keep track of which noodle is which, they are referenced by a key
 * that is a concatenation of the noodle's source and target socket keys. This also means
 * that a `Noodle` is unmounted and replaced by a new one as soon as the user changes the
 * source or target.
 * 
 * *This system is inspired by [Blender](https://www.blender.org/).*
 * 
 * **Note**
 * 
 * > I noticed that I used `undefined` as a placeholder value for when a noodle is
 * > collapsed. This is bad practice and should be replaced with `null` so that it can be
 * > distinguished from when a socket key is `undefined` due to a bug.
 * 
 * @module
 */

import { useEffect, useState } from 'react'
import Noodle from '@/components/Noodle'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import { addConnection, removeConnection } from '@/redux/programSlice'


/** 
 * Represents a noodle that goes from `source` to `target`. Both values are either socket
 * keys or undefined. If one of them is `undefined`, the socket pair represents a noodle
 * that is collapsed. This means that both handles are located at the given socket and 
 * only the loose handle can be dragged. A socket pair where both source and target are
 * `undefined` is considered invalid.
 */
type SocketPair = {
  source: string | undefined
  target: string | undefined
}

/**
 * Given a socket pair, returns a unique key used to index noodles.
 * @param pair - The socket pair that should be transformed into a noodle key.
 * @returns The noodle key that corresponds to the socket pair.
 */
const getNoodleKey = (pair: SocketPair) => `${pair.source}:${pair.target}`


/** @category Component */
export default function NoodleProvider(): JSX.Element {
  const dispatch = useDispatchTyped()

  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)
  const connections = useSelectorTyped((state) => state.program.connections)

  // React state
  /**
   * The socket pairs for each noodle that is connected only on one side (collapsed/loose).
   * Noodles that are connected on both sides are called `connections` and are included in
   * the {@link "renderer/redux/programSlice" programSlice}.
   */
  const [looseNoodles, setLooseNoodles] = useState<{ [key: string]: SocketPair }>({})

  /**
   * Handler for when a noodle is moved such that a socket key is updated. This is passed
   * down to the noodle components that call this function once a connection is changed
   * by the user.
   * 
   * This implements all the logic behind creating, moving and deleting noodles. It
   * updates programSlice und looseNoodles to reflect the events that are triggered by
   * dragging the handle of a noodle. This has to be done here instead of directly in the
   * `Noodle` component, because loose noodles have to be spawned and de-spawned for every
   * noodle that was changed and updates can be centralized.
   */
  function handleSocketUpdate(
    oldSource: string | undefined,
    oldTarget: string | undefined,
    newSource: string | undefined,
    newTarget: string | undefined,
  ) {
    // Check if parameters are valid
    if (newSource === oldSource && newTarget === oldTarget) return
    if (newSource !== oldSource && newTarget !== oldTarget) {
      console.warn('NoodleProvider: Socket key update for a noodle that switched socket on both sides.')
      return
    }
    if (!newSource) {
      console.warn('NoodleProvider: The user should not be able to disconnect a noodle on the left.')
      return
    }

    // Update noodles that are connected on both sides
    if (oldSource && oldTarget)
      dispatch(removeConnection({
        source: allSockets[oldSource],
        target: allSockets[oldTarget],
      }))
    if (newSource && newTarget)
      dispatch(addConnection({
        source: allSockets[newSource],
        target: allSockets[newTarget],
      }))

    // Copy of state that will be updated and set back to state
    const newLoose = { ...looseNoodles }
    const insert = (socketPair: SocketPair) => newLoose[getNoodleKey(socketPair)] = socketPair
    const remove = (socketPair: SocketPair) => delete newLoose[getNoodleKey(socketPair)]

    if (oldSource && oldTarget) {
      // Case: right side was moved or disconnected
      insert({ source: undefined, target: oldTarget })
      if (newTarget) // Case: right side was moved
        remove({ source: undefined, target: newTarget })
    } else {
      // Case: right or left was freshly connected from a collapsed noodle
      remove({ source: undefined, target: newTarget })
    }

    // Set new state
    setLooseNoodles(newLoose)
  }


  useEffect(() => {
    // Get all sockets that are empty
    const emptySockets = { ...allSockets }
    Object
      .keys(connections)
      .forEach(connKey => delete emptySockets[connections[connKey].target.socketKey])

    // Spawn collapsed noodles at each empty socket
    setLooseNoodles(Object
      .keys(emptySockets)
      .reduce((res, key) => {
        const pair = {
          source: !allSockets[key].isInput ? key : undefined,
          target: allSockets[key].isInput ? key : undefined
        }
        res[getNoodleKey(pair)] = pair
        return res
      }, {} as { [key: string]: SocketPair })
    )
  }, [allSockets])

  return (
    <div>
      {[
        // Generate all loose noodles
        ...Object
          .keys(looseNoodles)
          .filter(key => {
            // When a node is deleted, the noodles are unmounted before the sockets of the
            // node are removed. To prevent a "socket not found" error, only valid noodles
            // are rendered.
            const pair = looseNoodles[key]
            return (!pair.source || allSockets[pair.source]) && (!pair.target || allSockets[pair.target])
          })
          .map((key) =>
            <Noodle
              keyLeft={looseNoodles[key].source}
              keyRight={looseNoodles[key].target}
              key={key}
              noodleID={key}
              onSocketUpdate={(newSource, newTarget) => handleSocketUpdate(
                looseNoodles[key].source,
                looseNoodles[key].target,
                newSource,
                newTarget,
              )}
            />
        ),

        // Generate all connections
        ...Object
          .keys(connections)
          .filter(key => {
            // When a node is deleted, the noodles are unmounted before the sockets of the
            // node are removed. To prevent a "socket not found" error, only valid noodles
            // are rendered.
            const pair = connections[key]
            return allSockets[pair.source.socketKey] && allSockets[pair.target.socketKey]
          })
          .map((key) =>
            <Noodle
              keyLeft={connections[key].source.socketKey}
              keyRight={connections[key].target.socketKey}
              key={key}
              noodleID={key}
              onSocketUpdate={(newSource, newTarget) => handleSocketUpdate(
                connections[key].source.socketKey,
                connections[key].target.socketKey,
                newSource,
                newTarget,
              )}
            />
        ),
      ]}
    </div>
  )
}