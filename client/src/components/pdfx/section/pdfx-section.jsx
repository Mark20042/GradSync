import React from 'react';
import { View } from '@react-pdf/renderer';
import { theme } from '../../../lib/pdfx-theme';

export const Section = ({
    spacing = 'md',
    padding,
    variant = 'default',
    border = false,
    background,
    style = {},
    children
}) => {
    const spacingMap = {
        none: 0,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
        xl: theme.spacing.xl,
    };

    const paddingMap = {
        none: 0,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
        lg: theme.spacing.lg,
    };

    const sectionStyle = {
        marginBottom: spacingMap[spacing],
        padding: padding ? paddingMap[padding] : 0,
        backgroundColor: background || (variant === 'default' ? 'transparent' : theme.colors.muted),
        borderWidth: border ? theme.primitives.borderWidth : 0,
        borderColor: theme.colors.border,
        ...style,
    };

    return <View style={sectionStyle}>{children}</View>;
};
