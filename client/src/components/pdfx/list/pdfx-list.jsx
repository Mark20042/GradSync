import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { theme } from '../../../lib/pdfx-theme';

export const PdfList = ({
    items = [],
    variant = 'bullet',
    gap = 'sm',
    style = {}
}) => {
    const gapMap = {
        xs: theme.spacing.xs,
        sm: theme.spacing.sm,
        md: theme.spacing.md,
    };

    const listStyle = {
        flexDirection: 'column',
        gap: gapMap[gap],
        ...style,
    };

    const itemStyle = {
        flexDirection: 'row',
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.foreground,
        fontFamily: 'Times-Roman',
    };

    const bulletStyle = {
        width: 15,
        fontFamily: 'Times-Roman',
    };

    const textStyle = {
        flex: 1,
        fontFamily: 'Times-Roman',
    };

    const renderBullet = (index) => {
        switch (variant) {
            case 'numbered':
                return `${index + 1}. `;
            case 'bullet':
            default:
                return '• ';
        }
    };

    return (
        <View style={listStyle}>
            {items.map((item, index) => (
                <View key={index} style={itemStyle}>
                    <Text style={bulletStyle}>{renderBullet(index)}</Text>
                    <Text style={textStyle}>{item.text || item}</Text>
                </View>
            ))}
        </View>
    );
};
