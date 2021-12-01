import { bold, yellow, green, red } from 'kleur'
import { PlannedDiffPerResource, PlannedDiff } from '../types/expressions'
const version = require('./../../package.json').version

export function printHeader() {
    console.log(`
█▀▀ ▄▀█ █ █ █▄ █ ▄▀█
█▀  █▀█ █▄█ █ ▀█ █▀█   Schema Migrate ${bold().cyan(version)}`)
}

export function printMessage(m: string, type?: 'default' | 'info' | 'success' | 'error') {
    switch (type) {
        case 'info':
            console.log(yellow(m));
            break;
        case 'success':
            console.log(green(m));
            break;
        default:
            console.log(bold().cyan().italic(m));
            break;
    }
}


export function printChangeTable(data: PlannedDiffPerResource) {

    const { 
        resourceAdds: rolesAdded,
        resourceDeletes: rolesDeleted,
        resourceChanged: rolesChanged,
    } = operations(data['Role'])
    const { 
        resourceAdds: collectionAdded,
        resourceDeletes: collectionDeleted,
        resourceChanged: collectionChanged,
    } = operations(data['Collection'])
    const { 
        resourceAdds: functionAdded,
        resourceDeletes: functionDeleted,
        resourceChanged: functionChanged,
    } = operations(data['Function'])
    const { 
        resourceAdds: indexAdded,
        resourceDeletes: indexDeleted,
        resourceChanged: indexChanged,
    } = operations(data['Index'])
    const { 
        resourceAdds: accessProviderAdded,
        resourceDeletes: accessProviderDeleted,
        resourceChanged: accessProviderChanged,
    } = operations(data['AccessProvider'])
    const { 
        resourceAdds: databaseAdded,
        resourceDeletes: databaseDeleted,
        resourceChanged: databaseChanged,
    } = operations(data['Database'])

    renderResourceData(
        'Role', 
        rolesAdded as string[],
        rolesDeleted as string[],
        rolesChanged as string[],
    )
    renderResourceData(
        'Collection', 
        collectionAdded as string[],
        collectionDeleted as string[],
        collectionChanged as string[]
    )
    renderResourceData(
        'Function', 
        functionAdded as string[],
        functionDeleted as string[],
        functionChanged as string[]
    )
    renderResourceData(
        'Index', 
        indexAdded as string[],
        indexDeleted as string[],
        indexChanged as string[]
    )
    renderResourceData(
        'Access Provider', 
        accessProviderAdded as string[],
        accessProviderDeleted as string[],
        accessProviderChanged as string[]
    )
    renderResourceData(
        'Database', 
        databaseAdded as string[],
        databaseDeleted as string[],
        databaseChanged as string[]
    )
}

// Helper Functions
const renderResourceData = 
    (title: string, adds: string[], deletes: string[], changed: string[]) => {
    if(adds.length > 0 || deletes.length > 0 || changed.length > 0) {
        console.log(
            bold().underline(`\n ${title}: `)
        )
        adds.forEach(item => 
            console.log(green(`\t added: ${item}`))   
        )
        deletes.forEach(item => console.log(red(`\t deleted: ${item}`)))
        changed.forEach(item => console.log(yellow(`\t changed: ${item}`)))
    }
}

const operations = (resource: PlannedDiff) => {
    const resourceAdds = resource.added?.length > 0 ? 
        resource.added.map(item => item.target?.name) : []
    const resourceDeletes = resource.deleted?.length > 0 ?
        resource.deleted.map(item => item.previous?.name) : []
    const resourceChanged = resource.changed?.length > 0 ? 
        resource.changed.map(item => item.previous?.name) : []
    return {
        resourceAdds,
        resourceDeletes,
        resourceChanged
    }
}