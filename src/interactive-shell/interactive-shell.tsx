// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

export enum ShellState {
  Menu,
  Executing,
  UserInput,
  UserInputReceived,
}

export const printWithMargin = (message: string, margin: number) => {
  console.info(
    message
      .split('\n')
      .map((e) => ' '.repeat(margin) + e)
      .join('\n')
  )
}
