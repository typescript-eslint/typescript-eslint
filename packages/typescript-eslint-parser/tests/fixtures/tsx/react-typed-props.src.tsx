import * as React from 'react'
type Props = {
  title: string
}

export default function App(props: Props) {
  return (
    <h1>
      {props.title}
    </h1>
  )
}