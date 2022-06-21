import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {
  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.identifiers)
  const noodles = Object.keys(allSockets).map((key, index) =>
    <Noodle
      defaultSocketKeyLeft={!allSockets[key].isInput ? key : undefined}
      defaultSocketKeyRight={allSockets[key].isInput ? key : undefined}
      key={index}
      noodleID={index.toString()}
    />
  )

  return (
    <div>
      {/* <Noodle
        defaultSocketKeyLeft='node1.output.right'
        defaultSocketKeyRight='node3.in-select_out-query.left'
        key={0}
        noodleID='0'
      /> */}
      {noodles}
    </div>
  )
}