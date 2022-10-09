---
id: "ipc"
title: "Module: ipc"
sidebar_label: "ipc"
sidebar_position: 0
custom_edit_url: null
---

## Variables

### contextBridge

• `Const` **contextBridge**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exposeInMainWorld` | (`ipcKey`: `string`, `ipc`: `any`) => `void` |

#### Defined in

[ipc.ts:131](https://github.com/bischoff-m/nodecode/blob/3133122/packages/nodecode-ui/src/ipc.ts#L131)

___

### ipcRenderer

• `Const` **ipcRenderer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `invoke` | { `getPackage`: () => `Promise`<`NodePackage`\> ; `getProgram`: () => `Promise`<`NodeProgram`\> ; `toBackend`: (`channel`: keyof `ServerToClientEvents`, `timeout`: `number`, `args`: [] \| [program: unknown, callback: Function]) => `Promise`<`any`\>  } |
| `invoke.getPackage` | () => `Promise`<`NodePackage`\> |
| `invoke.getProgram` | () => `Promise`<`NodeProgram`\> |
| `invoke.toBackend` | (`channel`: keyof `ServerToClientEvents`, `timeout`: `number`, `args`: [] \| [program: unknown, callback: Function]) => `Promise`<`any`\> |
| `on` | `NoStringIndex`<{ `fromBackend`: (`listener`: (`event`: `IpcRendererEvent`, ...`args`: [channel: "output", msg: unknown]) => `void`) => `void`  }\> |
| `removeAllListeners` | (`channel`: ``"fromBackend"``) => `IpcRenderer` |
| `send` | { `saveProgram`: (`program`: `NodeProgram`) => `void` ; `toBackend`: (`channel`: keyof `ServerToClientEvents`, `args`: [] \| [program: unknown, callback: Function]) => `void`  } |
| `send.saveProgram` | (`program`: `NodeProgram`) => `void` |
| `send.toBackend` | (`channel`: keyof `ServerToClientEvents`, `args`: [] \| [program: unknown, callback: Function]) => `void` |

#### Defined in

[ipc.ts:119](https://github.com/bischoff-m/nodecode/blob/3133122/packages/nodecode-ui/src/ipc.ts#L119)

## Functions

### getIpcMain

▸ **getIpcMain**(`win`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `win` | `BrowserWindow` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `fromBackend` | (...`args`: [win: BrowserWindow, channel: "output", msg: unknown]) => `void` |
| `handle` | `NoStringIndex`<{ `getPackage`: (`listener`: (`event`: `IpcMainInvokeEvent`, ...`args`: []) => `Promise`<`NodePackage`\>) => `void` ; `getProgram`: (`listener`: (`event`: `IpcMainInvokeEvent`, ...`args`: []) => `Promise`<`NodeProgram`\>) => `void` ; `toBackend`: (`listener`: (`event`: `IpcMainInvokeEvent`, ...`args`: [channel: keyof ServerToClientEvents, timeout: number, args: [] \| [program: unknown, callback: Function]]) => `Promise`<`any`\>) => `void`  }\> |
| `on` | `NoStringIndex`<{ `saveProgram`: (`listener`: (`event`: `IpcMainEvent`, ...`args`: [program: NodeProgram]) => `void`) => `void` ; `toBackend`: (`listener`: (`event`: `IpcMainEvent`, ...`args`: [channel: keyof ServerToClientEvents, args: [] \| [program: unknown, callback: Function]]) => `void`) => `void`  }\> |
| `removeAllListeners` | (`channel`: ``"toBackend"`` \| ``"saveProgram"``) => `IpcMain` |
| `removeHandler` | (`channel`: ``"getProgram"`` \| ``"getPackage"`` \| ``"toBackend"``) => `void` |

#### Defined in

[ipc.ts:91](https://github.com/bischoff-m/nodecode/blob/3133122/packages/nodecode-ui/src/ipc.ts#L91)
