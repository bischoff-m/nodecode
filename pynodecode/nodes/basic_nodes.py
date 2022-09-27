from pynodecode.core import Node
from pynodecode.util import register_node


@register_node('list_input')
class InputListNode(Node):
    def calculate(self, field=None):
        items = self.state['item_list']
        list_type = self.state['datatype']

        if list_type == 'Int':
            self.output['output'] = [int(x) for x in items]
        elif list_type == 'Float':
            self.output['output'] = [float(x) for x in items]
        elif list_type == 'Boolean':
            self.output['output'] = [bool(x) for x in items]
        else:
            self.output['output'] = items

@register_node('output')
class OutputNode(Node):
    def calculate(self, field=None):
        print(self.useInput('input'))
        return self.useInput('input')
