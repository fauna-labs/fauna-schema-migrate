import React, { useState } from 'react';
import { Static, Text, useInput } from 'ink';
import { interactiveShell } from '../interactive-shell';

interface Props {
    handleUserInput: any
}

function UserInput(props: Props): JSX.Element {
    const [capturedInput, setCapturedInput] = useState("")

    useInput((input, key) => {
        if (key.return) {
            props.handleUserInput(capturedInput)
            setCapturedInput("")
        }
        else {
            setCapturedInput(capturedInput + input)
        }
    });

    return <>
        <Text>{"*".repeat(capturedInput.length)}</Text>
    </>
}

export default UserInput;