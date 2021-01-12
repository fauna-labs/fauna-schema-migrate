import * as React from 'react';
import { Box, Text, } from 'ink'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'
import Divider from 'ink-divider';
import { faunaPurple1, faunaPurple2, gray, orange } from '../colors';
import Link from 'ink-link';

export const askAdminKey = () => {
    return <>
        <Text color={orange}>
            Please provide a FaunaDB admin key o r
            Enter your key or the <Text color={faunaPurple2}> FAUNA_ADMIN_KEY </Text>
            environment variable to get rid of this question
            Use the dashboard's
            <Link url="https://dashboard.fauna.com/">
                <Text underline={true}>(https://dashboard.fauna.com/_</Text>
            </Link>
            Security tab to get an admin key for your database.
        </Text>
    </>
}