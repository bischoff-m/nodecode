# %%
# import websocket
# import _thread
# import time


# def on_message(ws, message):
#     print(message)


# def on_error(ws, error):
#     print(error)


# def on_close(ws, close_status_code, close_msg):
#     print("### closed ###")


# def on_open(ws):
#     def run(*args):
#         for i in range(3):
#             time.sleep(1)
#             ws.send("Hello %d" % i)
#         time.sleep(1)
#         ws.close()
#         print("thread terminating...")
#     _thread.start_new_thread(run, ())


# if __name__ == "__main__":
#     websocket.enableTrace(True)
#     ws = websocket.WebSocketApp("ws://echo.websocket.org/",
#                                 on_open=on_open,
#                                 on_message=on_message,
#                                 on_error=on_error,
#                                 on_close=on_close)

#     ws.run_forever()


# %%

import json
from functools import partial

with open('./config/nodeCollections/basic_nodes.json', 'r') as f:
    nodes = json.load(f)

with open('./config/programs/example_program.json', 'r') as f:
    program = json.load(f)


def exec_input_list(static_args):
    print(static_args)
    return 42


def exec_output(static_args):
    print(static_args)
    return 42


def get_execute(program_nodeid):
    # get node object from program that corresponds to program_nodeid
    try:
        program_node = next(node for node in program if node['id'] == program_nodeid)
    except StopIteration:
        raise Exception(f'NodeID {program_nodeid} not found.')

    # define, which method to execute for given node
    nodeid = program_node['nodeid']
    if nodeid == 'input_list':
        exec_method = exec_input_list
    elif nodeid == 'output':
        exec_method = exec_output
    else:
        raise Exception(f'Missing implementation for nodeID {nodeid}.')

    # check whether to bind static arguments given by program JSON file
    if 'arguments' not in program_node:
        arguments = {}
    else:
        arguments = program_node['arguments']

    # bind static arguments and return
    return partial(exec_method, arguments)


def run():
    # TODO: bind output of node to ID, so that it does not have to be
    #       executed twice if its output leads to multiple nodes

    output_nodes = [node for node in program if node['nodeid'] == 'output']
    if not output_nodes:
        raise Exception('No output node found.')
    elif len(output_nodes) > 1:
        raise Exception('Multiple output nodes are not implemented yet.')
    output_node = output_nodes[0]

    recursion_entry = get_execute(output_node['id'])
    out = recursion_entry()
    print(f'Finished execution with output: {out}')


run()

"""
exec_ methods:

- get parameter which nodes are connected to its inputs
- for each input that is needed
    - execute cell (with previous-node-parameter)
- use results to execute own node
- return result
- type checking??



- static parameters (from program JSON)
- dynamic parameters (from preceding nodes)

"""
None
# %%
