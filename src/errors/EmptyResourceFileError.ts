// Copyright Fauna, Inc.
// SPDX-License-Identifier: MIT-0

export class EmptyResourceFileError extends Error {
  constructor(filePath: string) {
    const message = `The following resource file did not return an FQL snippet.
        Is the FQL file empty or did you forget the default export in the JS file?
        ${filePath}
        `
    super(message)

    Object.setPrototypeOf(this, EmptyResourceFileError.prototype)
  }
}
