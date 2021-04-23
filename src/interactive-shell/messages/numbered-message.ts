// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

export type MessageFun = (id?: number) => JSX.Element

export interface NumberedMessage {
  id: number
  fun: MessageFun
}
