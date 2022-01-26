# %%
from typing import Type, Dict, List
from abc import ABC, abstractmethod
import networkx as nx
import matplotlib.pyplot as plt
import json

# TODO: update type hinting to python 3.9

NODE_CLASSES = []


class Node(ABC):
    # IDs, Connections, ...

    def __init__(self, static_args: Dict, predecessors):
        super().__init__()
        self.data = {}
        self.arguments = static_args
        self.connections = predecessors

    @abstractmethod
    def run(self):
        pass


def register_nodeclass(id: str, cls: Type[Node]):
    if id in NODE_CLASSES:
        raise Exception(f'Node class with ID {id} is already registered. Class: {NODE_CLASSES[id]}')
    NODE_CLASSES[id] = cls


class NodeProgram:
    def __init__(self, nodeList: List[Dict]):
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

        self.nodes = dict()
        for leaf in [x for x in G.nodes() if G.out_degree(x, weight='weight') == 0]:
            print(leaf)
            # filter leafs if already in self.nodes
            # add leafs to self.nodes
            # set weight to 0
            # repeat until all nodes are added

        pos = nx.circular_layout(G)
        nx.draw(G, pos, with_labels=True)
        plt.show()


with open('./config/programs/example_program.json', 'r') as f:
    program = json.load(f)

NodeProgram(program)

# %%
