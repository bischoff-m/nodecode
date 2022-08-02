import Noodle from '@/components/Noodle'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import { addConnection, removeConnection } from '@/redux/programSlice'
import { useEffect, useState } from 'react'

type SocketPair = {
  source: string | undefined
  target: string | undefined
}

const getNoodleKey = (pair: SocketPair) => `${pair.source}:${pair.target}`

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {
  const dispatch = useDispatchTyped()

  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)
  const connections = useSelectorTyped((state) => state.program.connections)

  // React state
  // The socket pairs in the form of { source: sourceSocketKey, target: targetSocketKey }
  // for each noodle that is connected only on one side (collapsed/loose)
  // Noodles that are connected on both sides are included in a separate state variable
  const [looseNoodles, setLooseNoodles] = useState<{ [key: string]: SocketPair }>({})

  // Callback for when a noodle is moved such that a socket key is updated
  const handleSocketUpdate = (
    oldSource: string | undefined,
    oldTarget: string | undefined,
    newSource: string | undefined,
    newTarget: string | undefined,
  ) => {
    // Check if parameters are valid
    if (newSource === oldSource && newTarget === oldTarget) return
    if (newSource !== oldSource && newTarget !== oldTarget) {
      console.warn('NoodleProvider: socket key update for a noodle that switched socket on both sides')
      return
    }
    if (!newSource) {
      console.warn('NoodleProvider: the user should not be able to disconnect a noodle on the left')
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
    let newLoose = { ...looseNoodles }
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
    setLooseNoodles(newLoose)
  }

  useEffect(() => {
    window.ipc.invoke
      .getProgram()
      .then((program) => Object
        .keys(program.connections)
        .forEach((connKey) => dispatch(addConnection(program.connections[connKey])))
      )
  }, [])

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
        ...Object
          .keys(looseNoodles)
          .filter(key => {
            // When a node is deleted, the noodles are unmounted before the sockets of the node are removed
            // To prevent a "socket not found" error, only valid noodles are rendered
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
        ...Object
          .keys(connections)
          .filter(key => {
            // When a node is deleted, the noodles are unmounted before the sockets of the node are removed
            // To prevent a "socket not found" error, only valid noodles are rendered
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