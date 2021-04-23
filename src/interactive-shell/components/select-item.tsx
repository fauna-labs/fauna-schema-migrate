// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import * as React from 'react'
import type { FC } from 'react'
import { Text, Box } from 'ink'

export interface Props {
  isSelected?: boolean
  label: string
  color?: string
  description: string
}

const Item: FC<Props> = ({ isSelected = false, label, color, description }) => (
  <Box width={100}>
    <Box width={21}>
      <Text color={isSelected ? color : undefined}>{label} </Text>
    </Box>
    <Text> {isSelected ? description : ''}</Text>
  </Box>
)

export default Item
