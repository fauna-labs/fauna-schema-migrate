import chalk from "chalk";
import { isSchemaCachingFaunaError } from "../errors/detect-errors";
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { notifyUnexpectedError } from "../interactive-shell/messages/messages";
import { rollbackMigrations } from "../migrations/rollback";

const rollback = async (options: any) => {
    try {
        // Create configuration file
        interactiveShell.startSubtask(`Rolling back ${options.amount} migrations`)
        // todo more details
        await rollbackMigrations(options.amount)
        interactiveShell.completeSubtask(`Rolled back`)
    } catch (error) {
        const description = isSchemaCachingFaunaError(error)
        if (description) {
            interactiveShell.reportWarning(description)
            interactiveShell.startSubtask(`Waiting for 60 seconds for cache to clear`)
            await new Promise(resolve => setTimeout(resolve, 60000));
            await rollback(options)
        } else {
            interactiveShell.reportError(error)
        }
    }
};

export default rollback;
