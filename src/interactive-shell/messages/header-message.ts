import { Message } from "./message";

export class HeaderMessage extends Message {
    public subtitle: string;

    constructor(message: string, subtitle: string) {
        super(message)
        this.subtitle = subtitle;
    }
}