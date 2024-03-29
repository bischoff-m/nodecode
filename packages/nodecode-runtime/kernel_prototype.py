
import json
from pynodecode.core import NodeProgram
import pynodecode.nodes as nodes
import socketio

# TODO: check if non-async client can process multiple requests at the same time
#       if async client is needed, uninstall requests and websocket dependencies

nodes.register_all()
sio = socketio.Client()


@sio.event
def connect():
    print('connection established')


@sio.event
def disconnect():
    print('disconnected from server')


@sio.on('run')
def on_run(data):
    print('message received with ', data)
    sio.emit('output', 'hier meine daten')

    # load and run example program and send back its output
    with open('./config/programs/example_program.json', 'r') as f:
        programDef = json.load(f)
    program = NodeProgram(programDef)
    # output = program.run()
    # return output
    return '42'


@sio.on('quit')
def on_quit():
    sio.disconnect()


sio.connect('http://localhost:5000')
sio.wait()
