# nodecode
Graphical Node Editor


(Fork from https://github.com/caoxiemeihao/vite-react-electron)

## Resources

- Process Model of Electron and i.e. safe file handling

## Adding an IPC Channel

1. Add a channel name here

		// File: src/preload/index.ts

		const toMainChannels: string[] = [
			...
		]

		const fromMainChannels: string[] = [
			...
		]

2. Add a handler

		// send   <-> on/once
		// invoke <-> handle/handleOnce

		// For message to main
		ipcMain.handle('mymessage', (event, ...args) => {
			return response
		})

		// For message from main
		window.api.handle('mymessage', (event, ...args) => {
			return response
		})

3. Send a message

		// For message to main
		window.api.invoke('mymessage', ...args).then((data) => {
			console.log(data)
		})

		// For message to renderer
    	win?.webContents.send('mymessage', ...args)

## Name??

- NodeLoom (noch nicht vergeben)
- NodeCode (noch nicht wirklich vergeben)
- NodePad
- NodeBook
- NodeWise
- NodeFolio
- NodeTweaker
- Nodex
- (Node)Weaver