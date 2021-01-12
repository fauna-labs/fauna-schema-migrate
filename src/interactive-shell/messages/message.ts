export class Message {
    public message: string | JSX.Element;

    constructor(message: string | JSX.Element) {
        this.message = message;
    }
}