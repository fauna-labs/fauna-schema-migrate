import chalk from "chalk";
import { interactiveShell } from "../interactive-shell/interactive-shell";
const run = async () => {
    try {
        if (process.env.FAUNA_LEGACY) {
            console.warn("FAUNA_LEGACY, is not supported for the run task, ignoring the variable.")
        }
        await interactiveShell.start()
    } catch (error) {
        interactiveShell.reportError(error)
    }
};

export default run;
