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
import { typography } from './typography';
import { colors } from './theme';
import { Ionicons } from '@expo/vector-icons';
import {
    CYCLE_PREDICTION_SOURCES,
    CYCLE_PREDICTION_METHODOLOGY,
} from './utils/cycle-prediction-sources';

type Lang = 'en' | 'sw';

interface CyclePredictionSourcesProps {
    language?: Lang;
    variant?: 'inline' | 'link';
}

export function NUICyclePredictionSources({
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
                    <Ionicons name="information-circle-outline" size={18} color={colors.brand.base} />
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
                <Ionicons name="information-circle-outline" size={13} color={colors.text.muted} />
                <Text style={styles.linkDisclaimer}>{t.shortDisclaimer}</Text>
                <Ionicons name="chevron-forward" size={12} color={colors.text.muted} />
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
                                <Ionicons name="close" size={22} color={colors.text.secondary} />
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
      ...typography.label,
      fontWeight: '400',
        color: colors.text.muted,
        fontStyle: 'italic',
        letterSpacing: 0.1,
    },
    inlineContainer: {
        // No horizontal margin: the card is a block-level sibling and the
        // screen's scroll container owns the gutter. Setting it here inset the
        // card a second time, so it sat 32pt narrower than the cards above it.
        marginVertical: 12,
        padding: 16,
        backgroundColor: colors.surface.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.brand,
    },
    inlineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    inlineTitle: {
      ...typography.caption,
        fontWeight: '700',
        color: colors.text.primary,
    },
    bodyText: {
      ...typography.caption,
        color: colors.text.secondary,
        marginBottom: 12,
    },
    sectionLabel: {
      ...typography.caption,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: 4,
        marginBottom: 8,
    },
    sourceRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    sourceNumber: {
      ...typography.label,
        color: colors.text.secondary,
        fontWeight: '600',
        marginRight: 6,
        minWidth: 18,
    },
    sourceTextContainer: {
        flex: 1,
    },
    sourceText: {
      ...typography.label,
      fontWeight: '400',
        color: colors.text.secondary,
    },
    sourceLink: {
      ...typography.label,
      fontWeight: '400',
        color: colors.brand.text,
        textDecorationLine: 'underline',
        marginTop: 2,
    },
    disclaimer: {
      ...typography.label,
      fontWeight: '400',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border.brand,
        fontStyle: 'italic',
        color: colors.text.muted,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: colors.surface.card,
        borderRadius: 12,
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
      ...typography.body,
        fontWeight: '700',
        color: colors.text.primary,
        flex: 1,
    },
    modalScroll: {
        maxHeight: '90%',
    },
});
