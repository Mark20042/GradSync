import React from 'react';
import { View } from '@react-pdf/renderer';
import { theme } from '../../../lib/pdfx-theme';

export const Divider = ({
    spacing = 'md',
    variant = 'solid',
    thickness = 'thin',
    color,
    style = {}
}) => {
    const spacingMap = {
        none: 0,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
    };

    const thicknessMap = {
        thin: 1,
        medium: 2,
        thick: 3,
    };

    const borderStyles = {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
    };

    const dividerStyle = {
        marginTop: spacingMap[spacing],
        marginBottom: spacingMap[spacing],
        borderBottomWidth: thicknessMap[thickness],
        borderBottomColor: color || theme.colors.border,
        borderBottomStyle: borderStyles[variant],
        ...style,
    };

    return <View style={dividerStyle} />;
};
