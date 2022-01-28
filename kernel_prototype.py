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
# import websocket
# import _thread
# import time


# def on_message(ws, message):
#     print(message)


# def on_error(ws, error):
#     print(error)


# def on_close(ws, close_status_code, close_msg):
#     print("### closed ###")


# def on_open(ws):
#     def run(*args):
#         for i in range(3):
#             time.sleep(1)
#             ws.send("Hello %d" % i)
#         time.sleep(1)
#         ws.close()
#         print("thread terminating...")
#     _thread.start_new_thread(run, ())


# if __name__ == "__main__":
#     websocket.enableTrace(True)
#     ws = websocket.WebSocketApp("ws://echo.websocket.org/",
#                                 on_open=on_open,
#                                 on_message=on_message,
#                                 on_error=on_error,
#                                 on_close=on_close)

#     ws.run_forever()

# %%
