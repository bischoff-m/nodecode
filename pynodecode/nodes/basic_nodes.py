from pynodecode.core import Node
from pynodecode.util import register_node


@register_node('input_list')
class InputListNode(Node):
    def run(self, field=None):
        output = self.arguments['item_list']
        list_type = self.arguments['datatype_dropdown']

        if list_type == 'Int':
            return [int(x) for x in output]
        elif list_type == 'Float':
            return [float(x) for x in output]
        elif list_type == 'Boolean':
            return [bool(x) for x in output]
        else:
            return output


@register_node('output')
class OutputNode(Node):
    def run(self, field=None):
        return [conn.get_data() for conn in self.connections.values()]
