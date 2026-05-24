import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Modal,
    ScrollView,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    CYCLE_PREDICTION_SOURCES,
    CYCLE_PREDICTION_METHODOLOGY,
} from './utils/cyclePredictionSources';

type Lang = 'en' | 'sw';

interface CyclePredictionSourcesProps {
    language?: Lang;
    variant?: 'inline' | 'link';
}

export function CyclePredictionSources({
                                           language = 'en',
                                           variant = 'link',
                                       }: CyclePredictionSourcesProps) {
    const [open, setOpen] = useState(false);
    const t = CYCLE_PREDICTION_METHODOLOGY[language];

    const renderBody = () => (
        <View>
            <Text style={styles.bodyText}>{t.description}</Text>
            <Text style={styles.sectionLabel}>{t.sourcesLabel}</Text>
            {CYCLE_PREDICTION_SOURCES.map((s, i) => (
                <View key={i} style={styles.sourceRow}>
                    <Text style={styles.sourceNumber}>{i + 1}.</Text>
                    <View style={styles.sourceTextContainer}>
                        <Text style={styles.sourceText} selectable>
                            {s.citation}
                        </Text>
                        {s.url ? (
                            <Text
                                style={styles.sourceLink}
                                onPress={() =>
                                    Linking.openURL(s.url as string).catch(() => undefined)
                                }
                            >
                                {s.url}
                            </Text>
                        ) : null}
                    </View>
                </View>
            ))}
            <Text style={styles.disclaimer}>{t.disclaimerLabel}</Text>
        </View>
    );

    if (variant === 'inline') {
        return (
            <View style={styles.inlineContainer}>
                <View style={styles.inlineHeader}>
                    <Ionicons name="information-circle-outline" size={18} color="#FF4C7C" />
                    <Text style={styles.inlineTitle}>{t.title}</Text>
                </View>
                {renderBody()}
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity
                style={styles.linkVariantContainer}
                onPress={() => setOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`${t.shortDisclaimer} ${t.viewSourcesLabel}`}
                hitSlop={6}
            >
                <Ionicons name="information-circle-outline" size={13} color="#9A6A75" />
                <Text style={styles.linkDisclaimer}>{t.shortDisclaimer}</Text>
                <Ionicons name="chevron-forward" size={12} color="#FF4C7C" />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
                    <Pressable style={styles.modalCard} onPress={() => undefined}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t.title}</Text>
                            <TouchableOpacity
                                onPress={() => setOpen(false)}
                                accessibilityRole="button"
                                accessibilityLabel="Close"
                            >
                                <Ionicons name="close" size={22} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>{renderBody()}</ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    linkVariantContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    linkDisclaimer: {
        fontSize: 11.5,
        color: '#8A6A72',
        fontStyle: 'italic',
        letterSpacing: 0.1,
    },
    inlineContainer: {
        marginHorizontal: 16,
        marginVertical: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0E8',
    },
    inlineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    inlineTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    bodyText: {
        fontSize: 13,
        color: '#444',
        lineHeight: 20,
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 4,
        marginBottom: 8,
    },
    sourceRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    sourceNumber: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginRight: 6,
        minWidth: 18,
    },
    sourceTextContainer: {
        flex: 1,
    },
    sourceText: {
        fontSize: 12,
        color: '#444',
        lineHeight: 18,
    },
    sourceLink: {
        fontSize: 12,
        color: '#FF4C7C',
        textDecorationLine: 'underline',
        marginTop: 2,
    },
    disclaimer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#FFE0E8',
        fontSize: 11,
        fontStyle: 'italic',
        color: '#777',
        lineHeight: 16,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        maxHeight: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
    },
    modalScroll: {
        maxHeight: '90%',
    },
});
