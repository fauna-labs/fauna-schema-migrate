import * as React from 'react';
import { Box, Text } from 'ink'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'
import Divider from 'ink-divider';
import { faunaPurple1, faunaPurple2, gray } from '../colors';

interface Props {
    title: string
    subtitle?: string
}

// eslint-disable-next-line react/function-component-definition
function Header(props: Props): JSX.Element {
    return <>
        <Box height={4}>
            <Gradient colors={[faunaPurple1, faunaPurple2]} >
                <BigText font="tiny" text={props.title} lineHeight={2} />
            </Gradient>
            <Box height="100%" alignItems="flex-end" justifyContent="flex-end" paddingTop={1}>
                <Text color={gray}>{props.subtitle}</Text>
            </Box>
        </Box>
        <Divider dividerColor={faunaPurple2} />
    </>
}

export default Header;

