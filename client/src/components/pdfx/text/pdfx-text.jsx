import React from 'react';
import { Text as PDFText } from '@react-pdf/renderer';
import { theme } from '../../../lib/pdfx-theme';

export const Text = ({
    variant = 'base',
    weight = 'normal',
    color,
    align = 'left',
    italic = false,
    noMargin = false,
    style = {},
    children
}) => {
    const fontSizes = {
        xs: 8,
        sm: 9,
        base: 10,
        lg: 11,
        xl: 12,
        '2xl': 14,
        '3xl': 16,
    };

    const fontFamilies = {
        normal: 'Times-Roman',
        medium: 'Times-Roman',
        semibold: 'Times-Bold',
        bold: 'Times-Bold',
    };

    const textStyle = {
        fontFamily: italic ? 'Times-Italic' : fontFamilies[weight],
        fontSize: fontSizes[variant],
        lineHeight: theme.typography.body.lineHeight,
        color: color || theme.colors.foreground,
        textAlign: align,
        marginBottom: noMargin ? 0 : theme.spacing.xs,
        ...style,
    };

    return <PDFText style={textStyle}>{children}</PDFText>;
};
