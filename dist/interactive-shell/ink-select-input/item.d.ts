import type { FC } from 'react';
export interface Props {
    isSelected?: boolean;
    label: string;
    color?: string;
    description: string;
}
declare const Item: FC<Props>;
export default Item;
