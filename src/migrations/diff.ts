const equalDeep = require('deep-equal')
const cloneDeep = require('lodash.clonedeep')

import {
  TaggedExpression,
  PlannedDiff,
  LoadedResources,
  StatementType,
  PlannedDiffPerResource,
  PlannedDatabaseDiff,
} from '../types/expressions'
import { UpdateIndexError } from '../errors/UpdateIndexError'
import { ResourceTypes } from '../types/resource-types'
import {
  explicitelySetAllParameters,
  transformCreateToDelete,
  transformCreateToUpdate,
  transformDbPathToCreate,
  transformDbPathToDelete,
  transformDbPathToUpdate,
  transformUpdateToCreate,
  transformUpdateToDelete,
  transformUpdateToUpdate,
} from '../fql/transform'
import deepEqual from 'deep-equal'

interface NamedValue {
  name: string
}

export const retrieveDatabasesDiff = async (
  currentDbs: string[][],
  targetDbs: string[][]
): Promise<TaggedExpression[]> => {
  const dbDiff: TaggedExpression[] = []
  currentDbs.forEach((c) => {
    const stillExists = targetDbs.some((t) => equalDeep(c, t))
    if (stillExists) {
      // don't support metadata for dbs atm.
      dbDiff.push(transformDbPathToUpdate(c))
    } else {
      dbDiff.push(transformDbPathToDelete(c))
    }
  })
  targetDbs.forEach((t) => {
    const didExistBefore = currentDbs.some((c) => equalDeep(c, t))
    if (!didExistBefore) {
      dbDiff.push(transformDbPathToCreate(t))
    }
  })
  return dbDiff
}

export const diffSnippets = (currentExpressions: LoadedResources, targetExpressions: LoadedResources) => {
  // the migrationsFQL param contains the last state of each resource.
  // the resourcesFQL param contains the state of the resources folder for each resource.
  // calculating what has changed is therefore easy.
  const migrationDiff: PlannedDiffPerResource = {}

  Object.keys(currentExpressions).forEach((type: string) => {
    const fromPerType: any = cloneDeep(currentExpressions[type])
    const targetPerType: any = cloneDeep(targetExpressions[type])
    migrationDiff[type] = createPairsForType(fromPerType, targetPerType)
  })

  // Index updates are not supported (and can't be), throw error.
  throwErrorOnIndexUpdates(migrationDiff[ResourceTypes.Index])
  return migrationDiff
}

/* We'll match them by name */
const createPairsForType = (currentExpressions: TaggedExpression[], targetExpressions: TaggedExpression[]) => {
  const pairs: PlannedDiff = {
    added: [],
    changed: [],
    unchanged: [],
    deleted: [],
  }
  while (targetExpressions.length > 0) {
    // Careful, this logic is used both for comparing pure Create statements (resources)
    // where two consecutive Create statements result in a change.
    // as well as comparing migrations (which contain Create/Update/Delete)
    const target = <TaggedExpression>targetExpressions.pop()
    const previousIndex = findIndex(target, currentExpressions)
    if (target?.statement === StatementType.Delete) {
      // ignore deletes
    } else if (previousIndex !== -1) {
      const res = currentExpressions.splice(previousIndex, 1)
      const previous = res[0]
      if (equalDeepWithExplicitParameters(previous, target)) {
        pairs.unchanged.push({ target: target, previous: previous })
      } else {
        pairs.changed.push({ target: target, previous: previous })
      }
    } else {
      pairs.added.push({ target: target })
    }
  }

  while (currentExpressions.length > 0) {
    const previous = currentExpressions.pop()
    pairs.deleted.push({ previous: previous })
  }

  return pairs
}

// Since we've set explicit paramaters, the diff might be off.
// if explicit parameters are set, those are set upon an Update.
// Therefore, if comparing to a Create, remove the explicit paramaters.
const equalDeepWithExplicitParameters = (e1: TaggedExpression, e2: TaggedExpression) => {
  let j1 = e1.jsonData
  let j2 = e2.jsonData
  if (e1.statement === StatementType.Create) {
    j2 = cloneDeep(j2)
    Object.keys(j2).forEach((k) => {
      if (j2[k] === null) {
        delete j2[k]
      }
    })
  }
  if (e2.statement === StatementType.Create) {
    j1 = cloneDeep(j1)
    Object.keys(j1).forEach((k) => {
      if (j1[k] === null) {
        delete j1[k]
      }
    })
  }
  return deepEqual(j1, j2)
}

export const transformDiffToExpressions = (diff: PlannedDiffPerResource): TaggedExpression[] => {
  const expressions: TaggedExpression[] = []
  for (const resourceType in ResourceTypes) {
    const diffForType = diff[resourceType]
    diffForType.added.map((prevCurr) => {
      if (prevCurr.target?.statement === StatementType.Update) {
        expressions.push(transformUpdateToCreate(prevCurr.target))
      } else if (prevCurr.target?.statement === StatementType.Create) {
        expressions.push(prevCurr.target)
      } else {
        throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
      }
    })

    diffForType.changed.map((prevCurr) => {
      // CHANGED
      // changed in rollback means that the migrations we are rolling back did an update.
      // The previous statement can be both a Create as an Update and since the resource
      // already exists it needs to be trasnformed to an Update.
      if (prevCurr.target?.statement === StatementType.Update) {
        // if it's an update, keep it
        expressions.push(transformUpdateToUpdate(prevCurr.target))
      } else if (prevCurr.target?.statement === StatementType.Create) {
        // if it's a create. trasnform to an update.
        expressions.push(transformCreateToUpdate(prevCurr.target))
      } else {
        throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
      }
    })

    diffForType.deleted.map((prevCurr) => {
      // ADDED
      // deleted in rollback means that the migrations we are rolling back added a resource.
      // The previous statement should therefore be a CREATE or UDPATE statement and
      // the current will not exist. We need to replace it with a DELETE
      if (prevCurr.previous?.statement === StatementType.Update) {
        // if it's an update, keep it
        expressions.push(transformCreateToDelete(prevCurr.previous))
      } else if (prevCurr.previous?.statement === StatementType.Create) {
        // if it's a create. trasnform to an update.
        expressions.push(transformUpdateToDelete(prevCurr.previous))
      } else {
        throw Error(`Unexpected type in rollback ${prevCurr.target?.statement}`)
      }
    })
  }
  return expressions
}

const findIndex = (resource1: NamedValue, resources: NamedValue[]) => {
  let index = 0
  for (const resource2 of resources) {
    if (resource2.name === resource1.name) {
      return index
    }
    index++
  }
  return -1
}

const throwErrorOnIndexUpdates = (indices: PlannedDiff) => {
  if (indices.changed.length > 0) {
    throw new UpdateIndexError(indices.changed)
  }
}
