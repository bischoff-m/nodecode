# %%

import json
from functools import partial

with open('./config/nodes/basic_nodes.json', 'r') as f:
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
        raise Exception(f'NodeID {program_nodeid} not found')
    
    # define, which method to execute for given node
    nodeid = program_node['nodeid']
    if nodeid == 'input_list':
        exec_method = exec_input_list
    elif nodeid == 'output':
        exec_method = exec_output
    else:
        raise Exception(f'Missing implementation for nodeID {nodeid}')
    
    # check whether to bind static arguments given by program JSON file
    if 'arguments' not in program_node:
        arguments = {}
    else:
        arguments = program_node['arguments']
    
    # bind static arguments and return
    return partial(exec_method, arguments)

def run():
    # get output node
    # get execution method for output node
    # start recursion
    # log output

    # try:
    #     program_node = next(node for node in program if node['id'] == program_nodeid)
    # except StopIteration:
    #     raise Exception(f'NodeID {program_nodeid} not found')
    
    return 42


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
