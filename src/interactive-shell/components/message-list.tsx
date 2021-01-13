import * as React from 'react';
import { Static } from 'ink';
import { useStore } from 'react-hookstore';
import { MessageFun } from '../messages/numbered-message';

interface Props {
}

// eslint-disable-next-line react/function-component-definition
function MessageList(props: Props): JSX.Element {
    const [messages] = useStore('messages');
    return <Static items={messages as MessageFun[]}>
        {handleItem}
    </Static>
}

function handleItem(fun: MessageFun, index: number) {
    const res = fun(index)
    return res
}

export default MessageList;