import { bold, yellow, green } from 'kleur'

export function printMessage(m: string, type?: 'default' | 'info' | 'success' | 'error') {
    switch (type) {
        case 'info':
            console.log(yellow(m));
            break;
        case 'success':
            console.log(green(m));
            break;
        default:
            console.log(bold().cyan().italic(m));
            break;
    }
}