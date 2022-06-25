import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'
import { Socket } from '@/redux/socketsSlice'
import { useEffect, useState } from 'react'

type NoodleKey = {
  left: string | undefined
  right: string | undefined
}

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {
  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)

  // React state
  // the keys in the form of { left: leftSocketKey, right: rightSocketKey } for each noodle
  const [noodleKeys, setNoodleKeys] = useState<NoodleKey[]>([])

  // const removeKey = (index: number) => {
  //   console.log('removeKey', index)
  //   if (index >= 0 && index < noodleKeys.length)
  //     setNoodleKeys([...noodleKeys.slice(0, index), ...noodleKeys.slice(index + 1)])
  // }
  // const setKey = (index: number, key: NoodleKey) => {
  //   console.log('setKey', index)
  //   if (index >= 0 && index < noodleKeys.length)
  //     setNoodleKeys([...noodleKeys.slice(0, index), key, ...noodleKeys.slice(index + 1)])
  // }

  // callback for when a noodle is moved such that a socket key is updated
  const handleSocketUpdate = (
    noodleID: number,
    leftSocketKey: string | undefined,
    rightSocketKey: string | undefined,
  ) => {
    // const noodleIndex = noodleKeys.findIndex((noodleKey) => noodleKey.left === leftSocketKey)
    const { left, right } = noodleKeys[noodleID]
    console.log('handleSocketUpdate', {
      noodleID,
      oldLeft: left,
      oldRight: right,
      newLeft: leftSocketKey,
      newRight: rightSocketKey,
    })
    // check if parameters are valid
    if (leftSocketKey !== left && rightSocketKey !== right) {
      console.warn('Noodle: socket key update for a noodle that is not connected on both sides')
      return
    }
    console.log('before', noodleKeys, rightSocketKey)

    // copy of noodleKeys that will be updated and set back to state
    let newNoodleKeys = [...noodleKeys]
    // update which sockets the noodle is connected to in internal state
    newNoodleKeys = [
      ...newNoodleKeys.slice(0, noodleID),
      { left: leftSocketKey, right: rightSocketKey, },
      ...newNoodleKeys.slice(noodleID + 1)
    ]

    // TODO: problem: setKey modifies the state, but the state is not updated yet
    //                so if removeKey updates the state, noodleKeys gets the value before setKey modified it

    // prevL		  prevR				  newL		  newR		    action
    // defined		defined				defined		undefined	  remove duplicate
    // defined		undefined			defined		defined		  spawn new collapsed at start, remove collapsed at end
    // undefined	defined				defined		defined		  no action

    // fix collisions where e.g. the updated noodle is now overlapping with another noodle
    if (rightSocketKey !== right)
      if (!rightSocketKey) {
        // case: noodle was connected on both ends before and got disconnected on the right side)
        // remove the noodle that was disconnected
        newNoodleKeys = [
          ...newNoodleKeys.slice(0, noodleID),
          ...newNoodleKeys.slice(noodleID + 1)
        ]
        // spawn a new collapsed noodle at the socket the noodle was previously connected to on the right side
        newNoodleKeys = [
          ...newNoodleKeys,
          { left: undefined, right: right, }
        ]
      } else {
        // case: either right was connected from a collapsed noodle
        //       or right was moved from one socket to another
        // remove other noodles that are connected to the same socket on the right
        for (let i = 0; i < newNoodleKeys.length; i++) {
          if (i == noodleID) continue
          if (newNoodleKeys[i].right === rightSocketKey)
            newNoodleKeys = [
              ...newNoodleKeys.slice(0, i),
              ...newNoodleKeys.slice(i + 1)
            ]
        }

        if (right) {
          // case: right was moved from one socket to another
          newNoodleKeys = [
            ...newNoodleKeys,
            { left: undefined, right: right }
          ]
        } else {
          // case: right was connected from a collapsed noodle
          newNoodleKeys = [
            ...newNoodleKeys,
            { left: left, right: undefined }
          ]
        }
        // const rightIndex = newNoodleKeys.findIndex(
        //   ({ right }) => right === rightSocketKey
        // )
        // // TODO: check if the first index is the one to delete
        // newNoodleKeys = [
        //   ...newNoodleKeys.slice(0, rightIndex),
        //   ...newNoodleKeys.slice(rightIndex + 1)
        // ]
      }
    console.log('after', newNoodleKeys)
    setNoodleKeys(newNoodleKeys)
  }

  // create a noodle for each empty socket and fill noodleKeys array
  const noodles = noodleKeys.map((keys, index) => {
    return <Noodle
      defaultSocketKeyLeft={keys.left}
      defaultSocketKeyRight={keys.right}
      key={index}
      noodleID={index.toString()}
      onSocketUpdate={(l, r) => handleSocketUpdate(index, l, r)}
    />
  })

  useEffect(() => {
    console.log('useEffect')
    setNoodleKeys(Object.keys(allSockets).map((key, index) => {
      return {
        left: !allSockets[key].isInput ? key : undefined,
        right: allSockets[key].isInput ? key : undefined
      }
    }))
  }, [])

  console.log('rerender')
  return (
    <div>
      {/* <Noodle
        defaultSocketKeyLeft={undefined}
        defaultSocketKeyRight='node3.in-select_out-query.left'
        key={0}
        noodleID='0'
        onSocketUpdate={(l, r) => handleSocketUpdate(0, l, r)}
      /> */}
      {noodles}
    </div>
  )
}