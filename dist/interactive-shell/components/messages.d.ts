/// <reference types="react" />
import { Message } from '../messages/message';
export interface NumberedMessage {
    id: number;
    message: Message;
}
interface Props {
}
declare function Messages(props: Props): JSX.Element;
export default Messages;
