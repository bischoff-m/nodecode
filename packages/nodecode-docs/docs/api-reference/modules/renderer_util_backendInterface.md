---
id: "renderer_util_backendInterface"
title: "Module: renderer/util/backendInterface"
sidebar_label: "renderer/util/backendInterface"
sidebar_position: 0
custom_edit_url: null
---

## Variables

### backend

• `Const` **backend**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `invoke` | (`channel`: keyof [`ServerToClientEvents`](../interfaces/renderer_types_server.ServerToClientEvents.md), ...`args`: [] \| [program: unknown, callback: Function]) => `Promise`<`unknown`\> |
| `invokeTimeout` | (`channel`: keyof [`ServerToClientEvents`](../interfaces/renderer_types_server.ServerToClientEvents.md), `timeout`: `number`, ...`args`: [] \| [program: unknown, callback: Function]) => `Promise`<`unknown`\> |
| `listenerCount` | (`channel`: `string`) => `number` |
| `on` | (`channel`: `string`, `callback`: (...`args`: `unknown`[]) => `void`) => `void` |
| `send` | (`channel`: keyof [`ServerToClientEvents`](../interfaces/renderer_types_server.ServerToClientEvents.md), ...`args`: [] \| [program: unknown, callback: Function]) => `void` |

#### Defined in

[packages/nodecode-ui/src/renderer/util/backendInterface.tsx:63](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/util/backendInterface.tsx#L63)
