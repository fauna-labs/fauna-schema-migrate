// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

import { faunaPurple1 } from '../interactive-shell/colors'

import * as fauna from 'faunadb'

export interface FaunaClients {
  [type: string]: { name?: string; children: FaunaClients; client: fauna.Client | false }
}
