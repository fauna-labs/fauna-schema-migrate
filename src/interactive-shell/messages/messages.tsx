// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as React from 'react'
import { Box, Newline, Text } from 'ink'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'
import Divider from 'ink-divider'
import { faunaPurple1, faunaPurple2, white, lightgray } from '../colors'
import Link from 'ink-link'
import { MessageFun } from './numbered-message'
import { Task } from '../../tasks'
import Spinner from 'ink-spinner'
import SyntaxHighlight from 'ink-syntax-highlight'
import { PlannedDiffPerResource, TaggedExpression } from '../../types/expressions'
import { ResourceTypes } from '../../types/resource-types'
import { ErrorWithFilePath } from '../../errors/ErrorWithFilePath'

const version = require('./../../../package.json').version

export const endTaskLine = () => {
  return (id?: number) => {
    return (
      <Box key={'divider_container_' + id} height={2} width={50} flexDirection="column">
        <Divider dividerColor={lightgray} key={'divider_' + id} />
      </Box>
    )
  }
}

export const startCommand = (task: Task): MessageFun => {
  return (id?: number) => {
    return (
      <Box key={'task_' + id} flexDirection={'column'} marginBottom={1}>
        <Text> Executing command: {task.description} </Text>
      </Box>
    )
  }
}

export const notifyUnexpectedError = (error: Error): MessageFun => {
  return (id?: number) => {
    return (
      <Box marginLeft={3} key={'error_' + id} flexDirection="column">
        {error instanceof ErrorWithFilePath ? notifyFilePath(error)(id) : null}
        <Box>
          <Text color={faunaPurple1} bold={true}>
            {' '}
            !{' '}
          </Text>
          <Text color="red">{error.toString()}</Text>
        </Box>
        <Box marginLeft={3} width={80} borderStyle="round" key={'error_stack_' + id}>
          <Text>{error.stack ? error.stack : JSON.stringify(error, null, 2)}</Text>
        </Box>
      </Box>
    )
  }
}

export const notifyFilePath = (error: ErrorWithFilePath): MessageFun => {
  return (id?: number) => {
    return (
      <Box>
        <Text color={faunaPurple1} bold={true}>
          {' '}
          !{' '}
        </Text>
        <Text color="red">Error at file: {error.filePath}</Text>
      </Box>
    )
  }
}

export const notifyBoxedCode = (message: string): MessageFun => {
  return (id?: number) => {
    return (
      <Box marginLeft={6} key={'info_' + id} borderStyle="round">
        <SyntaxHighlight code={message} language="js"></SyntaxHighlight>
      </Box>
    )
  }
}

export const notifyBoxedInfo = (message: string): MessageFun => {
  return (id?: number) => {
    return (
      <Box marginLeft={6} key={'info_' + id} borderStyle="round">
        <Text>{message}</Text>
      </Box>
    )
  }
}

export const notifyWarning = (message: string): MessageFun => {
  return (id?: number) => {
    return (
      <Box marginLeft={3} key={'warning_' + id}>
        <Text color="orange" bold={true}>
          {' '}
          !{' '}
        </Text>
        <Text color={white}>{message}</Text>
      </Box>
    )
  }
}

export const notifyTaskCompleted = (message: string): MessageFun => {
  return (id?: number) => {
    return (
      <Box marginLeft={3} key={'task_completed_' + id}>
        <Text color={faunaPurple1} bold={true}>
          {' '}
          ✔{' '}
        </Text>
        <Text color={white}>{message}</Text>
      </Box>
    )
  }
}

export const notifyTaskProcessing = (message: string): JSX.Element => {
  return (
    <Box marginLeft={4} key={'task_processing'}>
      <Spinner type="dots" />
      <Text color={white}> {message}</Text>
    </Box>
  )
}

export const renderHeader = (): MessageFun => {
  const title = 'Fauna'
  const subtitle = 'Schema Migrate ' + version
  return (id?: number) => (
    <Box key={'header_container_' + id} height={5} width={100} flexDirection="column">
      <Box key={'header_' + id} flexDirection="row">
        <Gradient colors={[faunaPurple1, faunaPurple2]}>
          <BigText font="tiny" text={title} lineHeight={2} />
        </Gradient>
        <Box marginLeft={2} height="100%" paddingTop={3}>
          <Text>{subtitle}</Text>
        </Box>
      </Box>
      <Divider dividerColor={faunaPurple2} key={'divider_' + id} />
    </Box>
  )
}

export const renderPlan = (plan: PlannedDiffPerResource) => {
  return (id?: number) => {
    let index = 0
    const toDisplay = []
    for (const item in ResourceTypes) {
      let toDisplayPerResource: any[] = []

      index++
      const changesPerResource = plan[item]
      changesPerResource.added.forEach((r) => {
        toDisplayPerResource.push(renderResource(index, r.target, 'added', id))
        index++
      })
      changesPerResource.changed.forEach((r) => {
        toDisplayPerResource.push(renderResource(index, r.target, 'changed', id))
        index++
      })
      changesPerResource.deleted.forEach((r) => {
        toDisplayPerResource.push(renderResource(index, r.previous, 'deleted', id))
        index++
      })
      toDisplay.push(renderResourceType(index, item, toDisplayPerResource, id))
      toDisplayPerResource = []
    }
    return (
      <Box flexDirection="column" key={'plan_' + id}>
        {toDisplay}
      </Box>
    )
  }
}

export const renderResourceType = (index: number, type: string, toDisplayPerResource: any[], id?: number) => {
  if (toDisplayPerResource.length > 0) {
    return (
      <Box flexDirection="row" marginLeft={6} key={'resource_' + id + '_' + index}>
        <Box width={16}>
          <Box>
            <Text bold={true}>{type}</Text>
          </Box>
        </Box>
        <Box flexDirection="column" paddingTop={0}>
          {toDisplayPerResource}
        </Box>
      </Box>
    )
  } else {
    return null
  }
}

export const renderResource = (index: number, resource: TaggedExpression | undefined, type: string, id?: number) => {
  return (
    <Text key={'resource_' + id + '_' + index}>
      {type}: {resource?.name}
    </Text>
  )
}

export const renderMigrationState = (
  allCloudMigrations: string[],
  localMigrations: string[],
  direction: string,
  amount: number
): MessageFun => {
  return (id?: number) => (
    <Box marginLeft={6} key={'migration_state_' + id} flexDirection="column" borderStyle="round">
      {renderMigrationItems(allCloudMigrations, localMigrations, id, direction, amount)}
    </Box>
  )
}

const renderMigrationItems = (
  allCloudMigrations: string[],
  localMigrations: string[],
  id: number | undefined,
  direction: string,
  amount: number
) => {
  const result: any[] = []
  if (allCloudMigrations.length === 0) {
    result.push(renderMigrationItem(`migration_item_${id}_${-1}`, ' '.repeat(24), 'cloud state'))
  }
  if (direction === 'rollback') {
    if (allCloudMigrations.length - amount < 0 && allCloudMigrations.length !== 0) {
      result.push(renderMigrationItem(`migration_item_${id}_${-1}`, ' '.repeat(24), 'rollback target'))
    }
    localMigrations.forEach((l, index) => {
      if (index === allCloudMigrations.length - amount - 1) {
        result.push(renderMigrationItem(`migration_item_${id}_${-1}`, l, 'rollback target'))
      } else if (index === allCloudMigrations.length - 1) {
        result.push(renderMigrationItem(`migration_item_${id}_${index}`, l, 'cloud state'))
      } else {
        result.push(renderMigrationItem(`migration_item_${id}_${index}`, l, ''))
      }
    })
  } else if (direction === 'apply') {
    localMigrations.forEach((l, index) => {
      if (index === allCloudMigrations.length + amount - 1) {
        result.push(renderMigrationItem(`migration_item_${id}_${-1}`, l, 'apply target'))
      } else if (index === allCloudMigrations.length - 1) {
        result.push(renderMigrationItem(`migration_item_${id}_${index}`, l, 'cloud state'))
      } else {
        result.push(renderMigrationItem(`migration_item_${id}_${index}`, l, ''))
      }
    })
  } else {
    localMigrations.forEach((l, index) => {
      if (index === allCloudMigrations.length - 1) {
        result.push(renderMigrationItem(`migration_item_${id}_${index}`, l, 'cloud state'))
      } else {
        result.push(renderMigrationItem(`migration_item_${id}_${index}`, l, ''))
      }
    })
    if (allCloudMigrations.length === localMigrations.length) {
      result.push(renderMigrationItem(`migration_item_${id}_${-1}`, ' '.repeat(24), 'apply target'))
    }
  }

  return result
}

const renderMigrationItem = (id: string, migrationItem: string, type: string | null) => {
  return (
    <Text key={`${id}_${migrationItem}_${type}`}>
      <Text>{migrationItem}</Text> {type ? <Text> ← {type}</Text> : ''}
    </Text>
  )
}

export const askAdminKey = (): MessageFun => {
  return (id?: number) =>
    askQuestion(
      id as number,
      <Text>
        Please provide a FaunaDB admin key or set the <Text color={faunaPurple2}> FAUNA_ADMIN_KEY </Text> environment
        and restart the tool.
        <Newline></Newline>
        To retrieve an admin key for your database, use the Security tab in dashboard
        <Link url="https://dashboard.fauna.com/">https://dashboard.fauna.com/</Link>
      </Text>
    )
}

const askQuestion = (id: number, content: any) => {
  return (
    <Box marginLeft={6} height="100%" marginTop={1} marginBottom={1} key={'question_' + id}>
      {/* <Text color={faunaPurple1} bold={true}> ? </Text> */}
      <Text key={'question_' + id}>{content}</Text>
    </Box>
  )
}
