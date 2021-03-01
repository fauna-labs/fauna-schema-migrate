import React from 'react'
import { render, Instance } from 'ink'
import { createStore } from 'react-hookstore';

import Shell from './components/shell';
import { askAdminKey, notifyBoxedCode, notifyBoxedInfo, notifyTaskCompleted, notifyTaskProcessing, notifyUnexpectedError, notifyWarning, renderHeader, renderMigrationState, renderPlan } from './messages/messages';
import { NumberedMessage, MessageFun } from './messages/numbered-message';
import { runTask } from '../tasks';
import { PlannedDiffPerResource } from '../types/expressions';
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

    private messages = createStore<MessageFun[]>('messages', [])
    private question = createStore<MessageFun | null>('question', null)
    private task = createStore<JSX.Element | null>('task', null)
    private cliState = createStore('cliState', ShellState.Menu)
    private result: Instance | null = null
    private userInput: string = ""

    constructor() {
        this.start = this.start.bind(this)
        this.close = this.close.bind(this)
        this.handleMenuSelection = this.handleMenuSelection.bind(this)
        this.handleUserInput = this.handleUserInput.bind(this)
    }

    start(interactive: boolean = true) {
        if (!this.result && process.env.NODE_ENV !== 'test') {
            if (!process.env.FAUNA_LEGACY) {
                this.addMessage(renderHeader())
                this.result = render(this.renderComponents())
            }
            else {
                const title = "Fauna"
                const subtitle = "Schema Migrate " + version
                printWithMargin(`Fauna Schema Migrate - ${version}
---------------------------------------`, 0)
            }
        }

        if (!interactive) {
            this.cliState.setState(ShellState.Executing)
        }
    }

    close() {
        if (this.result) {
            this.result.unmount()
        }
    }

    renderComponents() {
        return <Shell
            handleUserInput={this.handleUserInput}
            handleMenuSelection={this.handleMenuSelection}></Shell>
    }

    async handleMenuSelection(item: any) {
        this.cliState.setState(ShellState.Executing)
        await runTask(item, true)
        this.cliState.setState(ShellState.Menu)
    }

    async handleUserInput(input: string) {
        this.userInput = input
        this.cliState.setState(ShellState.UserInputReceived)
    }

    startSubtask(input: string) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            console.info('--- Starting subtask', input)
        }
        else {
            this.task.setState(notifyTaskProcessing(input))
        }
    }

    printBoxedCode(message: string) {
        if (!process.env.FAUNA_NOPRINT) {
            if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
                printWithMargin(message, 8)
            }
            else {
                this.addMessage(notifyBoxedCode(message))
            }
        }
    }

    printBoxedInfo(message: string) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            printWithMargin(message, 8)
        }
        else {
            this.addMessage(notifyBoxedInfo(message))
        }
    }

    completeSubtask(input: string) {
        if (process.env.FAUNA_LEGACY) {
            console.info('--- Finished subtask', input)
        }
        else {
            this.task.setState(null)
            this.addMessage(notifyTaskCompleted(input))
        }
    }

    setQuestion(q: MessageFun) {
        this.question.setState(q)
    }

    addMessage(m: MessageFun) {
        const messages = this.messages.getState()
        this.messages.setState(messages.concat(m))
    }

    requestAdminKey() {
        if (process.env.FAUNA_LEGACY) {
            const question = `Please provide a FaunaDB admin key or set the FAUNA_ADMIN_KEY environment and restart the tool.
To retrieve an admin key for your database, use the Security tab in dashboard https://dashboard.fauna.com/`
            printWithMargin(question, 4)
        }
        else {
            this.setQuestion(askAdminKey())
        }
        this.cliState.setState(ShellState.UserInput)
    }

    reportError(err: Error, interactive: boolean = true) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY || !interactive) {
            throw err
        }
        this.task.setState(null)
        this.addMessage(notifyUnexpectedError(err))
    }

    reportWarning(warn: string) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            console.warn(warn)
        }
        this.task.setState(null)
        this.addMessage(notifyWarning(warn))
    }

    renderMigrations(cloudTimestamps: string[], localTimestamps: string[], type: string, amount: number) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            printWithMargin(`--------- Current cloud migrations----------`, 0)
            printWithMargin(cloudTimestamps.join("\n"), 4)
            printWithMargin(`--------- Current local migrations ----------`, 0)
            printWithMargin(localTimestamps.join("\n"), 4)
            printWithMargin(`--------- Task ----------`, 0)
            printWithMargin(`${type} ${amount} migrations`, 4)
            console.info('\n')
        }
        else {
            this.addMessage(renderMigrationState(cloudTimestamps, localTimestamps, type, amount))
        }
    }

    renderPlan(plan: PlannedDiffPerResource) {
        if (process.env.NODE_ENV === 'test' || process.env.FAUNA_LEGACY) {
            console.info(JSON.stringify(plan, null, 2))
        }
        else {
            this.addMessage(renderPlan(plan))
        }
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

const printWithMargin = (message: string, margin: number) => {
    console.info(message
        .split('\n')
        .map((e) => " ".repeat(margin) + e)
        .join('\n'))
}

const interactiveShell = new InteractiveShell()
export { interactiveShell }