from pynodecode.core import register_nodeclass


# decorator that adds the decorated class to NODE_CLASSES in pynodecode.core
def register_node(nodeID):
    def decorator(cls):
        register_nodeclass(nodeID, cls)
        return cls
    return decorator
