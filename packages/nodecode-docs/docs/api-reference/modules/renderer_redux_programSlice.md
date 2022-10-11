---
id: "renderer_redux_programSlice"
title: "Module: renderer/redux/programSlice"
sidebar_label: "renderer/redux/programSlice"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### reducer

• **reducer**: `Reducer`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md), `AnyAction`\>

The slice's reducer.

#### Defined in

node_modules/@reduxjs/toolkit/dist/createSlice.d.ts:27

## Variables

### programSlice

• `Const` **programSlice**: `Slice`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md), { `addConnection`: (`state`: `WritableDraft`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md)\>, `action`: { `payload`: [`Connection`](../interfaces/renderer_types_NodeProgram.Connection.md) ; `type`: `string`  }) => `void` ; `addNode`: (`state`: `WritableDraft`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md)\>, `action`: { `payload`: { `key?`: `string` ; `node`: [`NodeInstance`](../interfaces/renderer_types_NodeProgram.NodeInstance.md)  } ; `type`: `string`  }) => `void` ; `moveNode`: (`state`: `WritableDraft`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md)\>, `action`: { `payload`: { `delta`: [`Vec2D`](renderer_types_util.md#vec2d-24) ; `key`: `string`  } ; `type`: `string`  }) => `void` ; `removeConnection`: (`state`: `WritableDraft`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md)\>, `action`: { `payload`: [`Connection`](../interfaces/renderer_types_NodeProgram.Connection.md) ; `type`: `string`  }) => `void` ; `removeNode`: (`state`: `WritableDraft`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md)\>, `action`: { `payload`: `string` ; `type`: `string`  }) => `void` ; `setFieldState`: (`state`: `WritableDraft`<[`NodeProgram`](../interfaces/renderer_types_NodeProgram.NodeProgram.md)\>, `action`: { `payload`: { `fieldKey`: `string` ; `fieldState`: [`FieldState`](renderer_types_NodeProgram.md#fieldstate-24) ; `nodeKey`: `string`  } ; `type`: `string`  }) => `void`  }, ``"program"``\>

#### Defined in

[packages/nodecode-ui/src/renderer/redux/programSlice.ts:16](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/programSlice.ts#L16)

## Functions

### addConnection

▸ **addConnection**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`Connection`](../interfaces/renderer_types_NodeProgram.Connection.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | [`Connection`](../interfaces/renderer_types_NodeProgram.Connection.md) |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### addNode

▸ **addNode**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.key?` | `string` |
| `payload.node` | [`NodeInstance`](../interfaces/renderer_types_NodeProgram.NodeInstance.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | { `key?`: `string` ; `node`: [`NodeInstance`](../interfaces/renderer_types_NodeProgram.NodeInstance.md)  } |
| `payload.key?` | `string` |
| `payload.node` | [`NodeInstance`](../interfaces/renderer_types_NodeProgram.NodeInstance.md) |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### moveNode

▸ **moveNode**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.delta` | [`Vec2D`](renderer_types_util.md#vec2d-24) |
| `payload.key` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | { `delta`: [`Vec2D`](renderer_types_util.md#vec2d-24) ; `key`: `string`  } |
| `payload.delta` | [`Vec2D`](renderer_types_util.md#vec2d-24) |
| `payload.key` | `string` |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### removeConnection

▸ **removeConnection**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`Connection`](../interfaces/renderer_types_NodeProgram.Connection.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | [`Connection`](../interfaces/renderer_types_NodeProgram.Connection.md) |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### removeNode

▸ **removeNode**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | `string` |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### setFieldState

▸ **setFieldState**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.fieldKey` | `string` |
| `payload.fieldState` | [`FieldState`](renderer_types_NodeProgram.md#fieldstate-24) |
| `payload.nodeKey` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | { `fieldKey`: `string` ; `fieldState`: [`FieldState`](renderer_types_NodeProgram.md#fieldstate-24) ; `nodeKey`: `string`  } |
| `payload.fieldKey` | `string` |
| `payload.fieldState` | [`FieldState`](renderer_types_NodeProgram.md#fieldstate-24) |
| `payload.nodeKey` | `string` |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123
