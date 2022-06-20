import Noodle from '@/components/Noodle'
import { useSelectorTyped } from '@/redux/hooks'

export type NoodleProviderProps = {}

export default function NoodleProvider(props: NoodleProviderProps) {
  // Redux state
  const allSockets = useSelectorTyped((state) => state.sockets.sockets)
  const noodles = allSockets.map((socket, index) =>
    <Noodle
      defaultSocketKeyLeft={!socket.isInput ? socket.key : undefined}
      defaultSocketKeyRight={socket.isInput ? socket.key : undefined}
      key={index}
      noodleID={index.toString()}
    />
  )
  console.log('new')

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