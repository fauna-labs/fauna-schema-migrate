import * as React from 'react';
import Messages from './messages';
import Menu from './menu';
import { useStore } from 'react-hookstore';
import { ShellState } from '../interactive-shell'
import { Static, Text } from 'ink';
import Header from './header';
import UserInput from './user-input';

interface Props {
    handleMenuSelection: any
    handleUserInput: any
}


// eslint-disable-next-line react/function-component-definition
function Shell(props: Props): JSX.Element {
    const [cliState, setCliState] = useStore('cliState');

    return <>
        < Messages ></Messages>
        { cliState === ShellState.UserInput ?
            <UserInput handleUserInput={props.handleUserInput}></UserInput> :
            null}
        { cliState === ShellState.Menu ?
            <Menu handleTaskChoice={props.handleMenuSelection}></Menu> :
            null}
    </>
}

export default Shell;