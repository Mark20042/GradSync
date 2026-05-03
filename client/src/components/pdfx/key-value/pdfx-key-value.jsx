import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { theme } from '../../../lib/pdfx-theme';

export const KeyValue = ({
    items = [],
    direction = 'horizontal',
    divided = false,
    size = 'md',
    labelFlex = 1,
    labelColor,
    valueColor,
    boldValue = false,
    style = {}
}) => {
    const fontSizes = {
        sm: 9,
        md: 10,
        lg: 11,
    };

    const containerStyle = {
        flexDirection: 'column',
        gap: theme.spacing.xs,
        ...style,
    };

    const rowStyle = {
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        justifyContent: direction === 'horizontal' ? 'space-between' : 'flex-start',
        paddingBottom: divided ? theme.spacing.xs : 0,
        borderBottomWidth: divided ? 1 : 0,
        borderBottomColor: theme.colors.border,
        marginBottom: divided ? theme.spacing.xs : 0,
    };

    const labelStyle = {
        fontSize: fontSizes[size],
        color: labelColor || theme.colors.mutedForeground,
        fontFamily: 'Times-Roman',
        flex: direction === 'horizontal' ? labelFlex : undefined,
    };

    const valueStyle = {
        fontSize: fontSizes[size],
        color: valueColor || theme.colors.foreground,
        fontFamily: boldValue ? 'Times-Bold' : 'Times-Roman',
    };

    return (
        <View style={containerStyle}>
            {items.map((item, index) => (
                <View key={index} style={rowStyle}>
                    <Text style={labelStyle}>{item.key}</Text>
                    <Text style={valueStyle}>{item.value}</Text>
                </View>
            ))}
        </View>
    );
};
