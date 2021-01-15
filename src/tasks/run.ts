import chalk from "chalk";
import { interactiveShell } from "../interactive-shell/interactive-shell";
const run = async () => {
    try {
        await interactiveShell.start()
    } catch (error) {
        interactiveShell.reportError(error)
    }
};

export default run;
