import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'
import { useEffect, useState } from 'react'

// TODO: fix problem where no noodles are spawned when the app is first loaded

type NoodleInfo = {
  left: string | undefined
  right: string | undefined
}

const getNoodleKey = (info: NoodleInfo) => `${info.left}:${info.right}`

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {
  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)

  // React state
  // the noodle infos in the form of { left: leftSocketKey, right: rightSocketKey } for each noodle
  const [noodleInfos, setNoodleInfos] = useState<{ [key: string]: NoodleInfo }>({})

  // callback for when a noodle is moved such that a socket key is updated
  const handleSocketUpdate = (
    noodleKey: string,
    leftSocketKey: string | undefined,
    rightSocketKey: string | undefined,
  ) => {
    const { left, right } = noodleInfos[noodleKey]
    // check if parameters are valid
    if (leftSocketKey !== left && rightSocketKey !== right) {
      console.warn('Noodle: socket key update for a noodle that is not connected on both sides')
      return
    }

    // copy of noodleKeys that will be updated and set back to state
    let newNoodleKeys = { ...noodleInfos }
    const newKey = getNoodleKey({ left: leftSocketKey, right: rightSocketKey })
    // update which sockets the noodle is connected to in internal state
    delete newNoodleKeys[noodleKey]
    if (!newNoodleKeys[newKey])
      newNoodleKeys[newKey] = { left: leftSocketKey, right: rightSocketKey }

    // fix collisions where e.g. the updated noodle is now overlapping with another noodle
    if (rightSocketKey !== right)
      if (!rightSocketKey) {
        // case: noodle was connected on both ends before and got disconnected on the right side)
        // spawn a new collapsed noodle at the socket the noodle was previously connected to on the right side
        const newCollapsedInfo = { left: undefined, right: right }
        newNoodleKeys[getNoodleKey(newCollapsedInfo)] = newCollapsedInfo
      } else {
        // case: either right was freshly connected from a collapsed noodle
        //       or right was moved from one socket to another
        // remove other noodles that are connected to the same socket on the right
        newNoodleKeys = Object
          .keys(newNoodleKeys)
          .filter(key => key === newKey || newNoodleKeys[key].right !== rightSocketKey)
          .reduce((res, key) => (res[key] = newNoodleKeys[key], res), {} as { [key: string]: NoodleInfo })

        if (right) {
          // case: right was moved from one socket to another
          const newCollapsedInfo = { left: undefined, right: right }
          newNoodleKeys[getNoodleKey(newCollapsedInfo)] = newCollapsedInfo
        } else {
          // case: right was freshly connected from a collapsed noodle
          const newCollapsedInfo = { left: left, right: undefined }
          newNoodleKeys[getNoodleKey(newCollapsedInfo)] = newCollapsedInfo
        }
      }
    setNoodleInfos(newNoodleKeys)
  }

  // create noodle components for the current state
  const noodles = Object
    .keys(noodleInfos)
    .map((key) =>
      <Noodle
        defaultSocketKeyLeft={noodleInfos[key].left}
        defaultSocketKeyRight={noodleInfos[key].right}
        key={key}
        noodleID={key}
        onSocketUpdate={(l, r) => handleSocketUpdate(key, l, r)}
      />
  )

  useEffect(() => {
    console.log('useEffect')
    setNoodleInfos(Object
      .keys(allSockets)
      .reduce((res, key) => {
        const info = {
          left: !allSockets[key].isInput ? key : undefined,
          right: allSockets[key].isInput ? key : undefined
        }
        res[getNoodleKey(info)] = info
        return res
      }, {} as { [key: string]: NoodleInfo })
    )
  }, [])

  console.log('rerender')
  return (
    <div>
      {noodles}
    </div>
  )
}