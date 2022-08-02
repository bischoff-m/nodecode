import Ajv from 'ajv'
import fs from 'fs'
import type { JSONSchema7 } from 'json-schema'
import path from 'path'


const fsOptions: Parameters<(typeof fs.readFileSync)>[1] = { flag: 'r', encoding: 'utf-8' }
export const readJSON = <T extends object>(...subpath: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(...subpath), fsOptions).toString())


let validatePackage: Ajv.ValidateFunction | null = null
const ajvPackage = new Ajv({ allErrors: true })

export async function usePackageValidate(): Promise<Ajv.ValidateFunction> {
  if (validatePackage !== null)
    return validatePackage

  const { schema, dependencies } = await getPackageSchema()
  dependencies.forEach(dep => {
    if (!dep.$id)
      throw new Error(`The $id property is required for all JSON schemas. ${JSON.stringify(dep)}`)
    !ajvPackage.getSchema(dep.$id) && ajvPackage.addSchema(dep, dep.$id)
  })
  validatePackage = ajvPackage.compile(schema)
  return validatePackage
}

const getPackageSchema = async () => {
  const root = 'public/config/schemas'
  const baseSchemaFile = readJSON<JSONSchema7>(root, 'NodePackage.schema.json')
  const dependencies = fs
    .readdirSync(path.join(root, 'fields'))
    .map(file => readJSON<JSONSchema7>(root, 'fields', file))

  return {
    schema: baseSchemaFile,
    dependencies: dependencies,
  }
}


let validateProgram: Ajv.ValidateFunction | null = null
const ajvProgram = new Ajv({ allErrors: true })

export async function useProgramValidate(): Promise<Ajv.ValidateFunction> {
  if (validateProgram !== null)
    return validateProgram
  const schema = await getProgramSchema()
  validateProgram = ajvProgram.compile(schema)
  return validateProgram
}

const getProgramSchema = async () => {
  const root = 'public/config/schemas'
  return readJSON<JSONSchema7>(root, 'NodeProgram.schema.json')
}