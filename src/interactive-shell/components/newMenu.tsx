const prompts = require('prompts');

export const renderMenu = async () => {
    const response = await prompts({
        type: 'select',
        name: 'main-menu',
        message: 'Choose an option',
        choices: [
            { 
                title: 'init',
                description: 'Initializing folders and config',
                value: '#ff0000' 
            },
            {
                title: 'state',
                description: 'Get the current state of cloud and local migrations',
                value: 'state' 
            },
            {
                title: 'generate',
                description: 'Generate migration from your resources',
                value: 'generate'
            },
            {
                title: 'rollback',
                description: 'Rollback applied migrations in the database',
                value: 'rollback'
            },
            {
                title: 'apply',
                description: 'Apply unapplied migrations against the database',
                value: 'apply'
            }
        ]
    });
    console.log(response);
}