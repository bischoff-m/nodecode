import ajv from 'ajv'
import fs from 'fs'
import type { JSONSchema7 } from 'json-schema'
import path from 'path'


const fsOptions: Parameters<(typeof fs.readFileSync)>[1] = { flag: 'r', encoding: 'utf-8' }
export const readJSON = <T extends object>(...subpath: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(...subpath), fsOptions).toString())


export async function useValidate(
  validate: ajv.ValidateFunction | null,
  ajv: ajv.Ajv,
  baseFile: 'NodePackage' | 'NodeProgram',
): Promise<ajv.ValidateFunction> {
  if (validate !== null)
    return validate

  const { schema, dependencies } = await getSchemas(baseFile)
  dependencies.forEach(dep => {
    if (!dep.$id)
      throw new Error(`The $id property is required for all JSON schemas. ${JSON.stringify(dep)}`)
    !ajv.getSchema(dep.$id) && ajv.addSchema(dep, dep.$id)
  })
  return ajv.compile(schema)
}


const getSchemas = async (baseFile: 'NodePackage' | 'NodeProgram') => {
  const root = 'public/config/schemas'
  const baseSchemaFile = readJSON<JSONSchema7>(root, `${baseFile}.schema.json`)
  const dependencies = fs
    .readdirSync(path.join(root, 'fields'))
    .map(file => readJSON<JSONSchema7>(root, 'fields', file))

  return {
    schema: baseSchemaFile,
    dependencies: dependencies,
  }
}



let validatePackage: ajv.ValidateFunction | null = null
const ajvPackage = new ajv({ allErrors: true })

export const usePackageValidate = async () => validatePackage = await useValidate(
  validatePackage,
  ajvPackage,
  'NodePackage',
)


let validateProgram: ajv.ValidateFunction | null = null
const ajvProgram = new ajv({ allErrors: true })

export const useProgramValidate = async () => validateProgram = await useValidate(
  validateProgram,
  ajvProgram,
  'NodeProgram',
)