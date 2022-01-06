import { execSync } from 'child_process'

export default function prebuild() {
  var result = execSync('npm exec json2ts ./public/config/nodeCollection.schema.json ./src/renderer/types/nodeCollection.d.ts').toString('utf8')
  console.log('Converting JSON Schemas to Typescript Type Definitions...\n')
  if (result !== '') {
    console.log(result)
    process.exit()
  }
}