# nodecode-ui

The frontend of nodecode. It can be used to build node programs visually. To execute them, the backend (nodecode-runtime) has to be installed.

(Fork from https://github.com/caoxiemeihao/vite-react-electron)

## Resources

- Process Model of Electron and i.e. safe file handling

## Adding a field

1. Add props and state definition in new file under `/public/config/schemas/fields`

1. Add new field as `Field` type in `NodePackage.schema.json`

1. Add `$ref` to field definition for `NodeState` and `FieldState` in `NodeProgram.schema.json`

1. Compile types using `npm run prebuild`

1. Implement field component under `/src/renderer/components/fields`

1. Add case in `getFieldComponent` in `/src/renderer/components/NodeProvider.tsx`

1. Add node that uses the new field

## Adding a node

1. Add definition in a file under `/public/config/packages`

1. (Currently it is necessary to reload the app)


# DEPRECATED

## Adding an IPC Channel

1. Add a channel name here

	```ts
	// File: src/preload/index.ts

	const toMainChannels: string[] = [
		// ...
	]

	const fromMainChannels: string[] = [
		// ...
	]
	```

1. Add a handler

	```ts
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
	```

1. Send a message

	```ts
	// For message to main
	window.ipc.invoke('mymessage', ...args).then((data) => {
		console.log(data)
	})

	// For message to renderer
	win?.webContents.send('mymessage', ...args)
	```