import type { FC } from 'react';
import type { Props as IndicatorProps } from './indicator';
import type { Props as ItemProps } from './item';
interface Props<V> {
    /**
     * Items to display in a list. Each item must be an object and have `label` and `value` props, it may also optionally have a `key` prop.
     * If no `key` prop is provided, `value` will be used as the item key.
     */
    items?: Array<Item<V>>;
    /**
     * Listen to user's input. Useful in case there are multiple input components at the same time and input must be "routed" to a specific component.
     *
     * @default true
     */
    isFocused?: boolean;
    /**
     * Index of initially-selected item in `items` array.
     *
     * @default 0
     */
    initialIndex?: number;
    /**
     * Number of items to display.
     */
    limit?: number;
    /**
     * Custom component to override the default indicator component.
     */
    indicatorComponent?: FC<IndicatorProps>;
    /**
     * Custom component to override the default item component.
     */
    itemComponent?: FC<ItemProps>;
    /**
     * Function to call when user selects an item. Item object is passed to that function as an argument.
     */
    onSelect?: (item: Item<V>) => void;
    /**
     * Function to call when user highlights an item. Item object is passed to that function as an argument.
     */
    onHighlight?: (item: Item<V>) => void;
}
export interface Item<V> {
    key?: string;
    label: string;
    color?: string;
    value: V;
    description: string;
}
declare function SelectInput<V>({ items, isFocused, initialIndex, indicatorComponent, itemComponent, limit: customLimit, onSelect, onHighlight }: Props<V>): JSX.Element;
export default SelectInput;
