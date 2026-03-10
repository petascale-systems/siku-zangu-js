import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Country = {
    code: string;        // 'KE' or 'TZ'
    dialCode: string;    // '+254' or '+255'
    name: string;        // 'Kenya' or 'Tanzania'
    nameSwahili: string; // 'Kenya' or 'Tanzania'
};

export const COUNTRIES: Country[] = [
    { code: 'KE', dialCode: '+254', name: 'Kenya', nameSwahili: 'Kenya' },
    { code: 'TZ', dialCode: '+255', name: 'Tanzania', nameSwahili: 'Tanzania' },
];

type Props = {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
    language: 'en' | 'sw';
};

export function CountryCodePicker({ selectedCountry, onSelect, language }: Props) {
    const [modalVisible, setModalVisible] = React.useState(false);

    const handleSelect = (country: Country) => {
        onSelect(country);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={styles.picker}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {language === 'en' ? 'Select Country' : 'Chagua Nchi'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={COUNTRIES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.countryItem,
                                        item.code === selectedCountry.code && styles.selectedItem,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={styles.countryName}>
                                        {language === 'en' ? item.name : item.nameSwahili}
                                    </Text>
                                    <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                                    {item.code === selectedCountry.code && (
                                        <Ionicons name="checkmark-circle" size={20} color="#E66386" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 12,
        paddingLeft: 16,
        borderRightWidth: 1,
        borderRightColor: '#FFB6C1',
        gap: 4,
    },
    dialCode: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    selectedItem: {
        backgroundColor: '#FFF0F5',
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    countryDialCode: {
        fontSize: 16,
        color: '#666',
        marginRight: 12,
    },
});