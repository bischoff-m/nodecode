import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'
import { useEffect, useState } from 'react'

type SocketPair = {
  left: string | undefined
  right: string | undefined
}

const getNoodleKey = (pair: SocketPair) => `${pair.left}:${pair.right}`

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {

  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)

  // React state
  // the socket pairs in the form of { left: leftSocketKey, right: rightSocketKey } for each noodle
  const [socketPairs, setSocketPairs] = useState<{ [key: string]: SocketPair }>({})
  // the noodle components, set in useEffect
  // (react kept warning me of a memory leak and i couldn't figure out any other way other than useState with components)
  const [noodles, setNoodles] = useState<JSX.Element[]>([])

  // callback for when a noodle is moved such that a socket key is updated
  const handleSocketUpdate = (
    noodleKey: string,
    leftSocketKey: string | undefined,
    rightSocketKey: string | undefined,
  ) => {
    const { left, right } = socketPairs[noodleKey]
    // check if parameters are valid
    if (leftSocketKey === left && rightSocketKey === right) return
    if (leftSocketKey !== left && rightSocketKey !== right) {
      console.warn('NoodleProvider: socket key update for a noodle that switched socket on both sides')
      return
    }

    // copy of noodleKeys that will be updated and set back to state
    let newSocketPairs = { ...socketPairs }
    const newKey = getNoodleKey({ left: leftSocketKey, right: rightSocketKey })
    // update which sockets the noodle is connected to in internal state
    if (!newSocketPairs[newKey])
      newSocketPairs[newKey] = { left: leftSocketKey, right: rightSocketKey }
    delete newSocketPairs[noodleKey]

    // fix collisions where e.g. the updated noodle is now overlapping with another noodle
    if (rightSocketKey !== right)
      if (!rightSocketKey) {
        // case: noodle was connected on both ends before and got disconnected on the right side
        // spawn a new collapsed noodle at the socket the noodle was previously connected to on the right side
        const newCollapsedPair = { left: undefined, right: right }
        newSocketPairs[getNoodleKey(newCollapsedPair)] = newCollapsedPair
      } else {
        // case: either right was freshly connected from a collapsed noodle
        //       or right was moved from one socket to another
        // remove other noodles that are connected to the same socket on the right
        newSocketPairs = Object
          .keys(newSocketPairs)
          .filter(key => key === newKey || newSocketPairs[key].right !== rightSocketKey)
          .reduce((res, key) => (res[key] = newSocketPairs[key], res), {} as { [key: string]: SocketPair })

        if (right) {
          // case: right was moved from one socket to another
          const newCollapsedPair = { left: undefined, right: right }
          newSocketPairs[getNoodleKey(newCollapsedPair)] = newCollapsedPair
        } else {
          // case: right was freshly connected from a collapsed noodle
          const newCollapsedPair = { left: left, right: undefined }
          newSocketPairs[getNoodleKey(newCollapsedPair)] = newCollapsedPair
        }
      }
    setSocketPairs(newSocketPairs)
  }

  useEffect(() => {
    // TODO: this probably has to change once the state is initialized from a file
    // spawn collapsed noodles at each socket
    setSocketPairs(Object
      .keys(allSockets)
      .reduce((res, key) => {
        const pair = {
          left: !allSockets[key].isInput ? key : undefined,
          right: allSockets[key].isInput ? key : undefined
        }
        res[getNoodleKey(pair)] = pair
        return res
      }, {} as { [key: string]: SocketPair })
    )
  }, [allSockets])

  useEffect(() => {
    // create noodle components for the current state
    setNoodles(Object
      .keys(socketPairs)
      .map((key) =>
        <Noodle
          defaultSocketKeyLeft={socketPairs[key].left}
          defaultSocketKeyRight={socketPairs[key].right}
          key={key}
          noodleID={key}
          onSocketUpdate={(l, r) => handleSocketUpdate(key, l, r)}
        />
      ))
  }, [allSockets, socketPairs])

  return (
    <div>
      {noodles}
    </div>
  )
}