from abc import ABC, abstractmethod


class Node(ABC):
    # IDs, Connections, ...

    def __init__(self):
        super().__init__()
        self.data = {}

    @abstractmethod
    def execute(self):
        pass
