// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as React from 'react'
import SelectInput from './select-input'
import { tasks, Task } from '../../tasks'
import { faunaPurple2 } from '../colors'

const version = require('./../../../package.json').version

interface Props {
  handleTaskChoice: any
}

// eslint-disable-next-line react/function-component-definition
function Menu(props: Props): JSX.Element {
  const renderOptions = () => {
    const items = tasks
      .filter((t: Task) => t.name !== 'run')
      .map((t: Task) => {
        return {
          label: t.name,
          action: t.action,
          description: t.description,
          color: faunaPurple2,
        }
      })

    const res = <SelectInput items={items} onSelect={props.handleTaskChoice} />
    return res
  }

  return <>{renderOptions()}</>
}

export default Menu
