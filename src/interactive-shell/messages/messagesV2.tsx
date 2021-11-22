import { bold, cyan, yellow, gray, red } from 'kleur/colors';

export const renderWelcomeMessage = (version: string) => {
    return `
        ${bold(yellow('Welcome to '))}${bold(cyan('Fauna Schema Migrate'))} ${gray(version)}
    `;
}