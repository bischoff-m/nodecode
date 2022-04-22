
# import json
# from pyknotflow.core import NodeProgram
# import pyknotflow.nodes as nodes

# nodes.register_all()

# with open('./config/programs/example_program.json', 'r') as f:
#     programDef = json.load(f)

# program = NodeProgram(programDef)
# output = program.run()

# for outputID, data in output.items():
#     print(f'Output Node {outputID}:')
#     print(data)

import asyncio
import socketio

sio = socketio.AsyncClient()


@sio.event
async def connect():
    print('connection established')


@sio.on('test')
async def on_test(data):
    print('message received with ', data)
    await sio.emit('test', {'response': 'my response'})


@sio.event
async def disconnect():
    print('disconnected from server')


async def main():
    await sio.connect('http://localhost:5000')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())
