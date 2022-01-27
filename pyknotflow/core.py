from typing import Type, Dict, List
from abc import ABC, abstractmethod
import networkx as nx

# TODO: update type hinting to python 3.9
# TODO: add docstrings to all classes and methods

NODE_CLASSES = dict()


class Node(ABC):
    def __init__(self, static_args: Dict, predecessors):
        super().__init__()
        self.cache = {}
        self.arguments = static_args
        self.connections = predecessors

    def get_data(self, field=None):
        if field not in self.cache:
            self.cache[field] = self.run(field)
        return self.cache[field]

    @abstractmethod
    def run(self, field):
        pass


def register_nodeclass(id: str, cls: Type[Node]):
    if id in NODE_CLASSES:
        raise Exception(f'Node class with ID {id} is already registered. Class: {NODE_CLASSES[id]}')
    NODE_CLASSES[id] = cls


class NodeProgram:
    def __init__(self, nodeList: List[Dict]):
        # check if all needed nodes were registered
        nodeIDs = {node['nodeID'] for node in nodeList}
        missing_IDs = nodeIDs - set(NODE_CLASSES)
        if missing_IDs:
            raise Exception(f'No implementation found for node IDs {missing_IDs}')

        # generate graph from nodes and connections
        G = nx.DiGraph()
        G.add_nodes_from([node['id'] for node in nodeList])
        for node in nodeList:
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
                node = next(node for node in nodeList if node['id'] == leafID)
                predecessors = {conn['toField']: self.nodes[conn['fromID']] for conn in node['connections']}
                nodeClass = NODE_CLASSES[node['nodeID']]
                self.nodes[leafID] = nodeClass(node['arguments'], predecessors)
                for source, target in G.out_edges(leafID):
                    G[source][target]['weight'] = 0

            # for the next iteration, use nodes where all predecessors have already been processed
            leaves = {x for x in G.nodes() if G.in_degree(x, weight='weight') == 0 and x not in self.nodes}

        for outputID in [n['id'] for n in nodeList if n['nodeID'] == 'output']:
            print(f'Output Node {outputID}:')
            print(self.nodes[outputID].get_data())
