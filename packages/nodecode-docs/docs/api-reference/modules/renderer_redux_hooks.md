---
id: "renderer_redux_hooks"
title: "Module: renderer/redux/hooks"
sidebar_label: "renderer/redux/hooks"
sidebar_position: 0
custom_edit_url: null
---

## Functions

### useDispatchTyped

▸ **useDispatchTyped**(): `ThunkDispatch`<`Object`, `undefined`, `AnyAction`\> & `Dispatch`<`AnyAction`\>

#### Returns

`ThunkDispatch`<`Object`, `undefined`, `AnyAction`\> & `Dispatch`<`AnyAction`\>

#### Defined in

[packages/nodecode-ui/src/renderer/redux/hooks.ts:5](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/redux/hooks.ts#L5)

___

### useSelectorTyped

▸ **useSelectorTyped**<`TSelected`\>(`selector`, `equalityFn?`): `TSelected`

#### Type parameters

| Name |
| :------ |
| `TSelected` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `selector` | (`state`: `Object`) => `TSelected` |
| `equalityFn?` | `EqualityFn`<`TSelected`\> |

#### Returns

`TSelected`

#### Defined in

node_modules/react-redux/es/types.d.ts:75
