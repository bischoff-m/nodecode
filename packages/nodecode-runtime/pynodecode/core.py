from typing import Type, Dict, List
from abc import ABC, abstractmethod
import networkx as nx

# TODO: update type hinting to python 3.10
# TODO: improve types to be as specific as possible
# TODO: add docstrings to all classes and methods

NODE_CLASSES = dict()


class Node(ABC):
    # TYPES:
    # init_state: Dict[field_key, field_state]
    # predecessors: Dict[in_field_key, (out_field_key, Node)]
    def __init__(self, init_state: Dict, predecessors: Dict):
        super().__init__()
        self.output = {}
        self.state = init_state
        
        def useInput(field_key: str):
            out_field, node = predecessors[field_key]
            return node.run(out_field)
        self.useInput = useInput

    def run(self, field=None):
        if field not in self.output:
            self.calculate(field)
        return self.output[field]

    @abstractmethod
    def calculate(self, field=None):
        pass


def register_nodeclass(id: str, cls: Type[Node]):
    if id in NODE_CLASSES:
        raise Exception(f'Node class with ID {id} is already registered. Class: {NODE_CLASSES[id]}')
    NODE_CLASSES[id] = cls


class NodeProgram:
    # TYPES:
    # programDef: NodeProgram
    def __init__(self, programDef):
        self.program = programDef
        nodeDefs = programDef['nodes']
        connectionDefs = programDef['connections']

        # check if all needed nodes were registered using @register_node(nodeID)
        nodeIDs = {node['type'] for _, node in nodeDefs}
        missing_IDs = nodeIDs - set(NODE_CLASSES)
        if missing_IDs:
            raise Exception(f'No implementation found for node IDs {missing_IDs}')

        return

        # generate graph from nodes and connections
        G = nx.DiGraph()
        G.add_nodes_from([node['id'] for node in programDef])
        for node in programDef:
            for conn in node['connections']:
                G.add_edge(
                    conn['fromID'],
                    node['id'],
                    field=conn['toField'],
                    weight=1
                )

        # check for cycles to prevent endless loop
        if list(nx.simple_cycles(G)):
            raise Exception('The given node program is invalid because it contains cycles.')

        # initialize node classes from leaves to roots
        self.nodes = dict()
        # start with nodes that have no predecessors
        leaves = {x for x in G.nodes() if G.in_degree(x, weight='weight') == 0}
        while leaves:
            # initialize all leaf nodes and set the weight of all outgoing edges to 0
            for leafID in leaves:
                node = next(node for node in programDef if node['id'] == leafID)
                predecessors = {conn['toField']: self.nodes[conn['fromID']] for conn in node['connections']}
                nodeClass = NODE_CLASSES[node['nodeID']]
                self.nodes[leafID] = nodeClass(node['arguments'], predecessors)
                for source, target in G.out_edges(leafID):
                    G[source][target]['weight'] = 0

            # for the next iteration, use nodes where all predecessors have already been processed
            leaves = {x for x in G.nodes() if G.in_degree(x, weight='weight') == 0 and x not in self.nodes}

    def run(self):
        output_nodes = [n['id'] for n in self.program if n['nodeID'] == 'output']
        return {outputID: self.nodes[outputID].get_data() for outputID in output_nodes}
