import * as React from 'react'
import MessageList from './message-list'
import Menu from './menu'
import { useStore } from 'react-hookstore'
import { ShellState } from '../interactive-shell'
import UserInput from './user-input'
import { MessageFun } from '../messages/numbered-message'

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
      <MessageList></MessageList>
      {task !== null ? (task as JSX.Element) : null}

      {cliState === ShellState.UserInput ? <UserInput handleUserInput={props.handleUserInput}></UserInput> : null}
      {cliState === ShellState.Menu ? <Menu handleTaskChoice={props.handleMenuSelection}></Menu> : null}
    </>
  )
}

export default Shell
