// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as React from 'react'
import { useStore } from 'react-hookstore'
import { ShellState } from '../interactive-shell'
import UserInput from './user-input'

interface Props {
  handleMenuSelection: any
  handleUserInput: any
}

// eslint-disable-next-line react/function-component-definition
function Shell(props: Props): JSX.Element {
  const [cliState] = useStore('cliState')
  const [task] = useStore('task')
  return (
    <>
      {task !== null ? (task as JSX.Element) : null}

      {cliState === ShellState.UserInput ? <UserInput handleUserInput={props.handleUserInput}></UserInput> : null}
      {cliState === ShellState.Menu ? <>{`Menu to be implemented`}</> : null}
    </>
  )
}

export default Shell
