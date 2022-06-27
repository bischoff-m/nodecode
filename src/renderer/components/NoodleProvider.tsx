import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'
import { useEffect, useState } from 'react'

// TODO: fix problem where no noodles are spawned when the app is first loaded

type SocketPair = {
  left: string | undefined
  right: string | undefined
}

let counter = 0
const getNewNoodleKey = () => counter++

const getNoodleKey = (pair: SocketPair) => `${pair.left}:${pair.right}`

export type NoodleProviderProps = {
  socketPairs: { [key: string]: SocketPair }
}

export default function NoodleProvider(props: NoodleProviderProps) {
  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)

  // React state
  // the socket pairs in the form of { left: leftSocketKey, right: rightSocketKey } for each noodle
  const [socketPairs, setSocketPairs] = useState({} as { [key: string]: SocketPair })
  // TODO: replace keys with indices that are generated on the fly
  //       reuse old noodles whenever possible
  //       write update methods that add and remove noodles
  // or move state to redux?

  // callback for when a noodle is moved such that a socket key is updated
  const handleSocketUpdate = (
    noodleKey: string,
    leftSocketKey: string | undefined,
    rightSocketKey: string | undefined,
  ) => {
    const { left, right } = socketPairs[noodleKey]
    // check if parameters are valid
    if (leftSocketKey !== left && rightSocketKey !== right) {
      console.warn('Noodle: socket key update for a noodle that is not connected on both sides')
      return
    }

    console.log('before', socketPairs)

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
        // TODO: "Warning: Can't perform a React state update on an unmounted component."
        // case: noodle was connected on both ends before and got disconnected on the right side
        // spawn a new collapsed noodle at the socket the noodle was previously connected to on the right side
        const newCollapsedPair = { left: undefined, right: right }
        console.log('noodle got disconnected on the right side', newSocketPairs[getNoodleKey(newCollapsedPair)])
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
          // TODO: "Warning: Can't perform a React state update on an unmounted component."
          // case: right was moved from one socket to another
          const newCollapsedPair = { left: undefined, right: right }
          console.log('right was moved from one socket to another', newSocketPairs[getNoodleKey(newCollapsedPair)])
          newSocketPairs[getNoodleKey(newCollapsedPair)] = newCollapsedPair
        } else {
          // case: right was freshly connected from a collapsed noodle
          const newCollapsedPair = { left: left, right: undefined }
          console.log('right was freshly connected from a collapsed noodle', newSocketPairs[getNoodleKey(newCollapsedPair)])
          newSocketPairs[getNoodleKey(newCollapsedPair)] = newCollapsedPair
        }
      }

    console.log('after', newSocketPairs)
    setSocketPairs(newSocketPairs)
  }

  // create noodle components for the current state
  const noodles = Object
    .keys(socketPairs)
    .map((key) =>
      <Noodle
        defaultSocketKeyLeft={socketPairs[key].left}
        defaultSocketKeyRight={socketPairs[key].right}
        key={getNewNoodleKey()}
        noodleID={key}
        onSocketUpdate={(l, r) => handleSocketUpdate(key, l, r)} // TODO: Problem(?): this callback changes when its called which triggers a state update
      />
  )

  useEffect(() => {
    console.log('useEffect')
    // TODO: if a node gets added or removed, all the noodles are reset
    //        -> keep all non-collapsed noodles instead
    setSocketPairs(Object
      .keys(allSockets)
      // .slice(0, 3)
      .reduce((res, key) => {
        const pair = {
          left: !allSockets[key].isInput ? key : undefined,
          right: allSockets[key].isInput ? key : undefined
        }
        res[getNoodleKey(pair)] = pair
        return res
      }, {} as { [key: string]: SocketPair })
    )
    return () => {
      console.log('NoodleProvider: cleanup')
    }
  }, [allSockets])

  console.log('rerender')
  return (
    <div>
      {noodles}
    </div>
  )
}