---
id: "renderer_components_NodeCanvas"
title: "Module: renderer/components/NodeCanvas"
sidebar_label: "renderer/components/NodeCanvas"
sidebar_position: 0
custom_edit_url: null
---

The NodeCanvas is the core component of the node editor. It contains the nodes and
connections of the current program. The whole canvas can be moved and zoomed. Nodes and
connections can be added and removed.

## Functions

### NodeCanvas

▸ **NodeCanvas**(): `Element`

The NodeCanvas is the core component of the node editor. It contains the nodes and
connections of the current program. The whole canvas can be moved and zoomed. Nodes and
connections can be added and removed.

#### Returns

`Element`

#### Defined in

[packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx:95](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx#L95)

___

### getCanvasZoom

▸ **getCanvasZoom**(): `number`

#### Returns

`number`

#### Defined in

[packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx:32](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx#L32)

___

### onZoomChanged

▸ **onZoomChanged**(`callback`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`newZoom`: `number`) => `void` |

#### Returns

`number`

#### Defined in

[packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx:34](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx#L34)

___

### screenToCanvas

▸ **screenToCanvas**(`position`): `Object`

Transforms screen coordinates to canvas coordinates (e.g. for mouse events).
This does not use the innerOffset and zoom variables because it would not account for
animations.
If this method is used before the `NodeCanvas` component is mounted, it will return
`NaN`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | [`Vec2D`](renderer_types_util.md#vec2d-24) | Screen coordinates to convert |

#### Returns

`Object`

Canvas coordinates after conversion

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Defined in

[packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx:49](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/renderer/components/NodeCanvas.tsx#L49)
