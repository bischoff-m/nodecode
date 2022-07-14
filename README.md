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
		window.ipc.handle('mymessage', (event, ...args) => {
			return response
		})

3. Send a message

		// For message to main
		window.ipc.invoke('mymessage', ...args).then((data) => {
			console.log(data)
		})

		// For message to renderer
    	win?.webContents.send('mymessage', ...args)


## Adding a field

1. Add props definition in new file under `/public/config/schemas/fields`

2. Add new field as `Field` type in `NodePackage.schema.json`

3. Compile types using `npm run prebuild`

4. Implement field component under `/src/renderer/components/fields`

5. Add case in `getFieldComponent` in `/src/renderer/util/nodeFactory.tsx`

6. Add node that uses the new field

## Adding a node

1. Add definition in a file under `/public/config/nodePackages`

2. (Currently it is necessary to reload the app)