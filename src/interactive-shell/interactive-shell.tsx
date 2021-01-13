import React from 'react'
import { render, Instance } from 'ink'
import { createStore } from 'react-hookstore';

import Shell from './components/shell';
import { notifyBoxedInfo, notifyTaskCompleted, notifyTaskProcessing, notifyUnexpectedError, notifyWarning, renderHeader } from './messages/messages';
import { NumberedMessage, MessageFun } from './messages/numbered-message';
import { runTask } from '../tasks/tasks';

export enum ShellState {
    Menu,
    Executing,
    UserInput,
    UserInputReceived
}

class InteractiveShell {
    // Messages is text that remains on screen and is not
    // redrawn, they remain statically on the screen or in other words,
    // are not interactive

    private messages = createStore<MessageFun[]>('messages', [])
    private question = createStore<MessageFun | null>('question', null)
    private task = createStore<JSX.Element | null>('task', null)
    private cliState = createStore('cliState', ShellState.Menu)
    private result: Instance | null = null
    private userInput: string = ""

    constructor() {
        this.handleMenuSelection = this.handleMenuSelection.bind(this)
        this.handleUserInput = this.handleUserInput.bind(this)
        this.addMessage(renderHeader())
    }

    start() {
        if (!this.result && process.env.NODE_ENV !== 'test') {
            this.result = render(this.renderComponents())
        }
    }

    renderComponents() {
        return <Shell
            handleUserInput={this.handleUserInput}
            handleMenuSelection={this.handleMenuSelection}></Shell>
    }

    async handleMenuSelection(item: any) {
        this.cliState.setState(ShellState.Executing)
        await runTask(item)
        this.cliState.setState(ShellState.Menu)
    }

    async handleUserInput(input: string) {
        this.userInput = input
        this.cliState.setState(ShellState.UserInputReceived)
    }

    startSubtask(input: string) {
        if (process.env.NODE_ENV === 'test') {
            console.log('=== Starting subtask', input)
        }
        this.task.setState(notifyTaskProcessing(input))
    }

    printBoxedInfo(message: string) {
        if (process.env.NODE_ENV === 'test') {
            console.log(`==============================================
${message}
`)
        }
        else {
            this.addMessage(notifyBoxedInfo(message))
        }
    }

    completeSubtask(input: string) {
        this.task.setState(null)
        this.addMessage(notifyTaskCompleted(input))
    }

    setQuestion(q: MessageFun) {
        this.question.setState(q)
    }

    addMessage(m: MessageFun) {
        const messages = this.messages.getState()
        this.messages.setState(messages.concat(m))
    }

    requestUserInput(q: MessageFun) {
        this.setQuestion(q)
        this.cliState.setState(ShellState.UserInput)
    }

    reportError(err: Error) {
        if (process.env.NODE_ENV === 'test') {
            console.error(err)
        }
        this.task.setState(null)
        this.addMessage(notifyUnexpectedError(err))
    }

    reportWarning(warn: string) {
        if (process.env.NODE_ENV === 'test') {
            console.warn(warn)
        }
        this.task.setState(null)
        this.addMessage(notifyWarning(warn))
    }

    async getUserInput(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            while (this.cliState.getState() !== ShellState.UserInputReceived) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return resolve(this.userInput)
        });
    }
}

export const interactiveShell = new InteractiveShell()