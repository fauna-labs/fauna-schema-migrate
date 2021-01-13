import * as React from 'react';
import { Box, Newline, Text, } from 'ink'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'
import Divider from 'ink-divider';
import { faunaPurple1, faunaPurple2, white, gray, lightgray } from '../colors';
import Link from 'ink-link';
import { MessageFun } from './numbered-message';
import { Task } from '../../tasks/tasks';
import Spinner from 'ink-spinner';

const version = require('./../../../package.json').version


export const endTaskLine = () => {
    return (id?: number) => {
        return <Box key={"divider_container_" + id} height={5} width={50} flexDirection="column">
            <Divider dividerColor={lightgray} key={"divider_" + id} />
        </Box>
    }
}

export const startCommand = (task: Task): MessageFun => {
    return (id?: number) => {
        return <Box key={"task_" + id} flexDirection={'column'} marginTop={1} marginBottom={1}>
            <Text> Executing command: {task.description} </Text>
        </Box>
    }
}

export const notifyUnexpectedError = (error: Error): MessageFun => {
    return (id?: number) => {
        return <Box marginLeft={3} key={"error_" + id} flexDirection="column">
            <Box>
                <Text color={faunaPurple1} bold={true}> ! </Text><Text color="red">{error.toString()}</Text>
            </Box>
            <Box marginLeft={3} width={80} borderStyle="round" borderColor={'grey'} key={"error_stack_" + id}>
                <Text color={gray}>{JSON.stringify(error, null, 2)}</Text>
            </Box>
        </Box>

    }
}

export const notifyBoxedInfo = (message: string): MessageFun => {
    return (id?: number) => {
        return <Box marginLeft={3} key={"info_" + id}>
            <Text color={gray} bold={true}> ! </Text><Text color={white}>{message}</Text>
        </Box>
    }
}

export const notifyWarning = (message: string): MessageFun => {
    return (id?: number) => {
        return <Box marginLeft={3} key={"warning_" + id}>
            <Text color="orange" bold={true}> ! </Text><Text color={white}>{message}</Text>
        </Box>
    }
}

export const notifyTaskCompleted = (message: string): MessageFun => {
    return (id?: number) => {
        return <Box marginLeft={3} key={"task_completed_" + id}>
            <Text color={faunaPurple1} bold={true}> ✔ </Text><Text color={white}>{message}</Text>
        </Box>
    }
}

export const notifyTaskProcessing = (message: string): JSX.Element => {
    return <Box marginLeft={4} key={"task_processing"}>
        <Spinner type="dots" /><Text color={white}> {message}</Text>
    </Box>
}


export const renderHeader = (): MessageFun => {
    const title = "Fauna"
    const subtitle = "Schema Migrate " + version
    return (id?: number) => <Box key={"header_container_" + id} height={5} width={100} flexDirection="column">
        <Box key={"header_" + id} flexDirection="row">
            <Gradient colors={[faunaPurple1, faunaPurple2]} >
                <BigText font="tiny" text={title} lineHeight={2} />
            </Gradient>
            <Box marginLeft={2} height="100%" paddingTop={3}>
                <Text color={gray}>{subtitle}</Text>
            </Box>
        </Box>
        <Divider dividerColor={faunaPurple2} key={"divider_" + id} />
    </Box>
}

export const askAdminKey = (): MessageFun => {
    return (id?: number) => askQuestion(id as number,
        <Text>Please provide a FaunaDB admin key or set
            the < Text color={faunaPurple2} > FAUNA_ADMIN_KEY </Text > environment
            variable to get rid of this question.
            < Newline ></Newline >
    To retrieve an admin key for your database, use the Security tab in dashboard
            < Link url="https://dashboard.fauna.com/" >
                https://dashboard.fauna.com/
            </Link >
        </Text>
    )
}

const askQuestion = (id: number, content: any) => {
    return <Box marginLeft={6} height="100%" marginTop={1} marginBottom={1} key={"question_" + id}>
        {/* <Text color={faunaPurple1} bold={true}> ? </Text> */}
        <Text color={gray} key={"question_" + id}>
            {content}
        </Text>
    </Box>

}
