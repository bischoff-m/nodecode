import { Redirect } from '@docusaurus/router'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from 'react'

export default function Home(): JSX.Element {
  return (
    <Redirect to='/docs' />
  )
}
