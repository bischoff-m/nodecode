import TypeDoc from 'typedoc'

// https://typedoc.org/guides/installation/
console.log('Generating documentation from comments...')

const app = new TypeDoc.Application()

app.options.addReader(new TypeDoc.TSConfigReader())
app.bootstrap({
  // typedoc options here
  entryPoints: ['src/renderer/main.tsx'],
})

const project = app.convert()

if (!project)
  throw new Error('Could not build TypeDoc documentation')

const outputDir = 'docs'
await app.generateDocs(project, outputDir)

console.log()