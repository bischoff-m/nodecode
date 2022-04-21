# %%

import json
from pyknotflow.core import NodeProgram
import pyknotflow.nodes as nodes

nodes.register_all()

with open('./config/programs/example_program.json', 'r') as f:
    programDef = json.load(f)

program = NodeProgram(programDef)
output = program.run()

for outputID, data in output.items():
    print(f'Output Node {outputID}:')
    print(data)

# %%



# %%
