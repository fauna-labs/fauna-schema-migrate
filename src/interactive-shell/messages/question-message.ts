import { Message } from "./message";

export class Question extends Message {
    constructor(message: string | JSX.Element) {
        super(message)
    }
}