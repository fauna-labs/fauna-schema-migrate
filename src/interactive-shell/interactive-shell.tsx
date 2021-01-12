import React from 'react'
import { render, Instance } from 'ink'
import { createStore } from 'react-hookstore';

import Shell from './components/shell';
import { NumberedMessage } from './components/messages';
import { HeaderMessage } from './messages/header-message';
import { Message } from './messages/message';
const version = require('./../../package.json').version

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
    private messageId: number = 1

    private messages = createStore<NumberedMessage[]>('messages', [
        {
            id: this.messageId++,
            message: new HeaderMessage('Fauna', "Schema Migrate " + version)
        }])
    private cliState = createStore('cliState', ShellState.Menu)
    private result: Instance | null = null
    private userInput: string = ""

    constructor() {
        this.handleMenuSelection = this.handleMenuSelection.bind(this)
        this.handleUserInput = this.handleUserInput.bind(this)
    }

    start() {
        this.result = render(this.renderComponents())
    }

    renderComponents() {
        return <Shell
            handleUserInput={this.handleUserInput}
            handleMenuSelection={this.handleMenuSelection}></Shell>
    }

    async handleMenuSelection(item: any) {
        this.cliState.setState(ShellState.Executing)
        await item.action()
        this.cliState.setState(ShellState.Menu)
    }

    async handleUserInput(input: string) {
        this.userInput = input
        this.cliState.setState(ShellState.UserInputReceived)
    }

    addMessage(m: Message) {
        const messages = this.messages.getState()
        this.messages.setState(messages.concat([
            { id: this.messageId, message: m }
        ]))
    }

    requestUserInput(t: Message) {
        this.addMessage(t)
        this.cliState.setState(ShellState.UserInput)
    }

    async getUserInput() {
        return new Promise(async (resolve, reject) => {
            while (this.cliState.getState() !== ShellState.UserInputReceived) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return resolve(this.userInput)
        });
    }
}

export const interactiveShell = new InteractiveShell()