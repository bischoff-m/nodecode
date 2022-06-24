import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'
import { Socket } from '@/redux/socketsSlice'

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {
  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)

  // create a map of socket key pairs to noodles
  // implement a method that computes all socket key pairs that should exist for this state

  // the keys in the form of "leftSocketKey:rightSocketKey" for each noodle
  const noodleKeys: { left: string | undefined, right: string | undefined }[] = []

  // the noodle components
  const noodles: JSX.Element[] = []

  // callback for when a noodle is moved such that a socket key is updated
  const handleSocketUpdate = (
    noodleID: number,
    leftSocketKey: string | undefined,
    rightSocketKey: string | undefined,
  ) => {
    const { left, right } = noodleKeys[noodleID]
    console.log('handleSocketUpdate', {
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
    // update which sockets the noodle is connected to in internal state
    noodleKeys[noodleID] = {
      left: leftSocketKey,
      right: rightSocketKey,
    }

    // fix collisions where e.g. the updated noodle is now overlapping with another noodle
    if (rightSocketKey === right)
      return
    if (!rightSocketKey) {
      // case: noodle was connected on both ends before and got disconnected on the right side
      noodleKeys.splice(noodleID, 1)
      noodles.splice(noodleID, 1)
      console.log('test2')
      // TODO: problem: the component does not re render
    } else {
      // either right was freshly connected from a collapsed noodle
      // or right was moved from one socket to another
      console.log('test')
    }
  }

  // create a noodle for each empty socket and fill noodleKeys array
  Object.keys(allSockets).forEach((key, index) => {
    const keyLeft = !allSockets[key].isInput ? key : undefined
    const keyRight = allSockets[key].isInput ? key : undefined
    noodleKeys.push({ left: keyLeft, right: keyRight })
    noodles.push(
      <Noodle
        defaultSocketKeyLeft={keyLeft}
        defaultSocketKeyRight={keyRight}
        key={index}
        noodleID={index.toString()}
        onSocketUpdate={(l, r) => handleSocketUpdate(index, l, r)}
      />
    )
  })

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