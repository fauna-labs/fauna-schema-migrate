import * as React from 'react';
import { Box, Static, Text } from 'ink';
import { useStore } from 'react-hookstore';
import { type } from 'os';
import Header from './header';
import { Message } from '../messages/message';
import { HeaderMessage } from '../messages/header-message';
import { faunaPurple1, white } from '../colors';


export interface NumberedMessage {
    id: number,
    message: Message
}

interface Props {
}

// eslint-disable-next-line react/function-component-definition
function Messages(props: Props): JSX.Element {
    const [tasks, setTasks] = useStore('messages');
    return <Static items={tasks as NumberedMessage[]}>
        {handleItem}
    </Static>
}

function handleItem(nm: NumberedMessage) {
    if (nm.message instanceof HeaderMessage) {
        return <Header key={"header_" + nm.id} title={nm.message.message as string} subtitle={nm.message.subtitle} ></Header >
    }
    else if (typeof nm.message.message === 'object') {
        return nm.message.message
    }
    else if (typeof nm.message.message === 'string') {
        return <Box key={"message_" + nm.id}>
            <Text color={faunaPurple1}> ✔ </Text><Text color={white}> {nm.message.message}</Text>
        </Box>
    }
    else {
        throw new Error("Unexpected message type " + typeof nm.message.message)
    }
}

export default Messages;