from ..node import Node


class InputListNode(Node):
    def run(self):
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


class OutputNode(Node):
    def run(self):
        for conn in self.connections:
            print(conn.get_value())
