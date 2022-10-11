---
id: "renderer_redux_socketsSlice"
title: "Module: renderer/redux/socketsSlice"
sidebar_label: "renderer/redux/socketsSlice"
sidebar_position: 0
custom_edit_url: null
---

## Variables

### positionSlice

• `Const` **positionSlice**: `Slice`<{ `[key: string]`: [`Vec2D`](renderer_types_util.md#vec2d-24);  }, { `addSocketPos`: (`state`: `WritableDraft`<{ `[key: string]`: [`Vec2D`](renderer_types_util.md#vec2d-24);  }\>, `action`: { `payload`: `AddSocketPayload` ; `type`: `string`  }) => `void` ; `moveNodeSocketsStop`: (`state`: `WritableDraft`<{ `[key: string]`: [`Vec2D`](renderer_types_util.md#vec2d-24);  }\>, `action`: { `payload`: `string` ; `type`: `string`  }) => `void` ; `removeSocketPos`: (`state`: `WritableDraft`<{ `[key: string]`: [`Vec2D`](renderer_types_util.md#vec2d-24);  }\>, `action`: { `payload`: `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> ; `type`: `string`  }) => `void`  }, ``"positions"``\>

#### Defined in

[packages/nodecode-ui/src/renderer/redux/socketsSlice.ts:61](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/socketsSlice.ts#L61)

___

### socketPositions

• `Const` **socketPositions**: `Object` = `{}`

#### Index signature

▪ [key: `string`]: [`Vec2D`](renderer_types_util.md#vec2d-24)

#### Defined in

[packages/nodecode-ui/src/renderer/redux/socketsSlice.ts:22](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/socketsSlice.ts#L22)

___

### socketsSlice

• `Const` **socketsSlice**: `Slice`<{ `[key: string]`: [`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md);  }, { `removeSocket`: (`state`: `WritableDraft`<{ `[key: string]`: [`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md);  }\>, `action`: { `payload`: `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> ; `type`: `string`  }) => `void` ; `updateSocket`: (`state`: `WritableDraft`<{ `[key: string]`: [`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md);  }\>, `action`: { `payload`: `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> ; `type`: `string`  }) => `void`  }, ``"identifiers"``\>

#### Defined in

[packages/nodecode-ui/src/renderer/redux/socketsSlice.ts:102](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/socketsSlice.ts#L102)

## Functions

### addSocketPos

▸ **addSocketPos**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `AddSocketPayload` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | `AddSocketPayload` |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### moveNodeSockets

▸ **moveNodeSockets**(`nodeKey`, `by`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeKey` | `string` |
| `by` | [`Vec2D`](renderer_types_util.md#vec2d-24) |

#### Returns

`void`

#### Defined in

[packages/nodecode-ui/src/renderer/redux/socketsSlice.ts:39](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/socketsSlice.ts#L39)

___

### moveNodeSocketsStop

▸ **moveNodeSocketsStop**(`payload`): `Object`

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

### onMoveNodeSockets

▸ **onMoveNodeSockets**(`callback`, `noodleID`): `OnMoveCallback`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `OnMoveCallback` |
| `noodleID` | `string` |

#### Returns

`OnMoveCallback`

#### Defined in

[packages/nodecode-ui/src/renderer/redux/socketsSlice.ts:32](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/socketsSlice.ts#L32)

___

### removeOnMoveNodeSockets

▸ **removeOnMoveNodeSockets**(`noodleID`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `noodleID` | `string` |

#### Returns

`boolean`

#### Defined in

[packages/nodecode-ui/src/renderer/redux/socketsSlice.ts:36](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/socketsSlice.ts#L36)

___

### removeSocket

▸ **removeSocket**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### removeSocketPos

▸ **removeSocketPos**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123

___

### socketsSlice

▸ **socketsSlice**(`state`, `action`): `CombinedState`<`Object`\>

A *reducer* (also called a *reducing function*) is a function that accepts
an accumulation and a value and returns a new accumulation. They are used
to reduce a collection of values down to a single value

Reducers are not unique to Redux—they are a fundamental concept in
functional programming.  Even most non-functional languages, like
JavaScript, have a built-in API for reducing. In JavaScript, it's
`Array.prototype.reduce()`.

In Redux, the accumulated value is the state object, and the values being
accumulated are actions. Reducers calculate a new state given the previous
state and an action. They must be *pure functions*—functions that return
the exact same output for given inputs. They should also be free of
side-effects. This is what enables exciting features like hot reloading and
time travel.

Reducers are the most important concept in Redux.

*Do not put API calls into reducers.*

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `undefined` \| `CombinedState`<`Object`\> |
| `action` | `AnyAction` |

#### Returns

`CombinedState`<`Object`\>

#### Defined in

node_modules/redux/index.d.ts:102

___

### updateSocket

▸ **updateSocket**(`payload`): `Object`

Calling this redux#ActionCreator with an argument will
return a PayloadAction of type `T` with a payload of `P`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `payload` | `Omit`<[`Socket`](../interfaces/renderer_types_NodeProgram.Socket.md), ``"socketKey"``\> |
| `type` | `string` |

#### Defined in

node_modules/@reduxjs/toolkit/dist/createAction.d.ts:123
