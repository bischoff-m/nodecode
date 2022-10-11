---
id: "renderer_lib_direct_styled_types"
title: "Module: renderer/lib/direct-styled/types"
sidebar_label: "renderer/lib/direct-styled/types"
sidebar_position: 0
custom_edit_url: null
---

## Interfaces

- [DirectStyled](../interfaces/renderer_lib_direct_styled_types.DirectStyled.md)

## Type Aliases

### DirectStyledStyle

Ƭ **DirectStyledStyle**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `_subscribe?` | (`updater`: [`Updater`](renderer_lib_direct_styled_types.md#updater-24)) => [`Unsubscriber`](renderer_lib_direct_styled_types.md#unsubscriber-24) |

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:19](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L19)

___

### InferReturnType

Ƭ **InferReturnType**<`C`\>: `React.ForwardRefExoticComponent`<`InferProps`<`C`\> & `React.RefAttributes`<{}\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `C` | extends [`WrappedComponentOrTag`](renderer_lib_direct_styled_types.md#wrappedcomponentortag-24) |

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:11](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L11)

___

### InnerProps

Ƭ **InnerProps**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `style` | `React.CSSProperties` & [`DirectStyledStyle`](renderer_lib_direct_styled_types.md#directstyledstyle-24) \| `undefined` |

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:23](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L23)

___

### StyleSetter

Ƭ **StyleSetter**: [`Updater`](renderer_lib_direct_styled_types.md#updater-24)

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:17](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L17)

___

### Unsubscriber

Ƭ **Unsubscriber**: (`updater`: [`Updater`](renderer_lib_direct_styled_types.md#updater-24)) => `void`

#### Type declaration

▸ (`updater`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `updater` | [`Updater`](renderer_lib_direct_styled_types.md#updater-24) |

##### Returns

`void`

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:16](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L16)

___

### Updater

Ƭ **Updater**: (`style`: `React.CSSProperties`) => `void`

#### Type declaration

▸ (`style`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `style` | `React.CSSProperties` |

##### Returns

`void`

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:15](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L15)

___

### WrappedComponentOrTag

Ƭ **WrappedComponentOrTag**: `React.ComponentType`<`any`\> \| keyof `JSX.IntrinsicElements`

#### Defined in

[packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts:3](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/lib/direct-styled/types.ts#L3)
