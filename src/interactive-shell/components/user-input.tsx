import React, { useState } from 'react';
import { Box, Static, Text, useInput } from 'ink';
import { interactiveShell } from '../interactive-shell';
import { faunaPurple1 } from '../colors';
import { useStore } from 'react-hookstore';

interface Props {
    handleUserInput: any
}

function UserInput(props: Props): JSX.Element {
    const [capturedInput, setCapturedInput] = useState("")
    const [question] = useStore('question');

    useInput((input, key) => {
        if (key.return) {
            const input = capturedInput.replace(/\s/g, '')
            setCapturedInput("")
            props.handleUserInput(input)
        }
        else {
            setCapturedInput(capturedInput + input)
        }
    });

    if (capturedInput && capturedInput.length > 0) {
        return <>
            { question}
            <Box marginLeft={6} height={3} width={80} borderStyle="round" borderColor={'grey'}>
                <Text>{"*".repeat(capturedInput.length)}</Text>
            </Box>
        </>
    }
    else {
        return <>
            { question}
            <Box marginLeft={6} height={3} width={80} borderStyle="round" borderColor={'grey'}>
            </Box>
        </>
    }

}

export default UserInput;