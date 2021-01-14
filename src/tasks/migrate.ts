import chalk from "chalk";
import { planMigrations } from "../migrations/plan"
import { writeMigrations, generateMigrations } from "../migrations/generate-migration"
import { interactiveShell } from "../interactive-shell/interactive-shell";
import { notifyWarning, renderPlan } from "../interactive-shell/messages/messages";

const migrate = async () => {
    try {
        interactiveShell.startSubtask(`Planning Migrations`)
        const planned = await planMigrations()
        interactiveShell.completeSubtask(`Planned Migrations`)

        interactiveShell.startSubtask(`Generating Migrations`)
        const migrations = await generateMigrations(planned)
        interactiveShell.completeSubtask(`Generated Migrations`)

        if (migrations.length === 0) {
            interactiveShell.addMessage(notifyWarning("There is no difference, nothing to write"))
        }
        else {
            interactiveShell.addMessage(renderPlan(planned))
            interactiveShell.startSubtask(`Write migrations`)
            await writeMigrations(migrations)
            interactiveShell.completeSubtask(`Written migrations`)
        }
    } catch (error) {
        interactiveShell.reportError(error)
    }
};

export default migrate;
