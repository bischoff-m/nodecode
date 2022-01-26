from abc import ABC, abstractmethod


class Node(ABC):
    # IDs, Connections, ...

    def __init__(self, static_args):
        super().__init__()
        self.data = {}
        self.arguments = static_args

    @abstractmethod
    def run(self):
        pass
