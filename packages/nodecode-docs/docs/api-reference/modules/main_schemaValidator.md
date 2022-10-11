---
id: "main_schemaValidator"
title: "Module: main/schemaValidator"
sidebar_label: "main/schemaValidator"
sidebar_position: 0
custom_edit_url: null
---

## Functions

### readJSON

▸ **readJSON**<`T`\>(...`subpath`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `...subpath` | `string`[] |

#### Returns

`T`

#### Defined in

[packages/nodecode-ui/src/main/schemaValidator.ts:8](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/main/schemaValidator.ts#L8)

___

### usePackageValidate

▸ **usePackageValidate**(): `Promise`<`ValidateFunction`\>

#### Returns

`Promise`<`ValidateFunction`\>

#### Defined in

[packages/nodecode-ui/src/main/schemaValidator.ts:48](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/main/schemaValidator.ts#L48)

___

### useProgramValidate

▸ **useProgramValidate**(): `Promise`<`ValidateFunction`\>

#### Returns

`Promise`<`ValidateFunction`\>

#### Defined in

[packages/nodecode-ui/src/main/schemaValidator.ts:58](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/main/schemaValidator.ts#L58)

___

### useValidate

▸ **useValidate**(`validate`, `ajv`, `baseFile`): `Promise`<`ajv.ValidateFunction`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `validate` | ``null`` \| `ValidateFunction` |
| `ajv` | `Ajv` |
| `baseFile` | ``"NodePackage"`` \| ``"NodeProgram"`` |

#### Returns

`Promise`<`ajv.ValidateFunction`\>

#### Defined in

[packages/nodecode-ui/src/main/schemaValidator.ts:12](https://github.com/bischoff-m/nodecode/blob/1978ab5/packages/nodecode-ui/src/main/schemaValidator.ts#L12)
