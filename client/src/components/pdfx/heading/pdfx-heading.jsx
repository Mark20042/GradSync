import React from 'react';
import { Text } from '@react-pdf/renderer';
import { theme } from '../../../lib/pdfx-theme';

export const Heading = ({
    level = 1,
    align = 'left',
    weight = 'bold',
    color,
    transform,
    noMargin = false,
    style = {},
    children
}) => {
    const fontSize = theme.typography.heading.fontSize[`h${level}`];
    const marginBottom = noMargin ? 0 : (level === 1 ? theme.spacing.md : theme.spacing.sm);

    const headingStyle = {
        fontFamily: theme.typography.heading.fontFamily,
        fontSize,
        lineHeight: theme.typography.heading.lineHeight,
        color: color || theme.colors.primary,
        textAlign: align,
        marginBottom,
        textTransform: transform || 'none',
        ...style,
    };

    return <Text style={headingStyle}>{children}</Text>;
};
