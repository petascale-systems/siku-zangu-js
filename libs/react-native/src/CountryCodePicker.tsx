import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Country = {
    code: string;
    dialCode: string;
    name: string;
    nameSwahili: string;
};

export const COUNTRIES: Country[] = [
    { code: 'DZ', dialCode: '+213', name: 'Algeria', nameSwahili: 'Algeria' },
    { code: 'AO', dialCode: '+244', name: 'Angola', nameSwahili: 'Angola' },
    { code: 'BJ', dialCode: '+229', name: 'Benin', nameSwahili: 'Benin' },
    { code: 'BW', dialCode: '+267', name: 'Botswana', nameSwahili: 'Botswana' },
    { code: 'BF', dialCode: '+226', name: 'Burkina Faso', nameSwahili: 'Burkina Faso' },
    { code: 'BI', dialCode: '+257', name: 'Burundi', nameSwahili: 'Burundi' },
    { code: 'CV', dialCode: '+238', name: 'Cabo Verde', nameSwahili: 'Cabo Verde' },
    { code: 'CM', dialCode: '+237', name: 'Cameroon', nameSwahili: 'Kameruni' },
    { code: 'CF', dialCode: '+236', name: 'Central African Republic', nameSwahili: 'Jamhuri ya Afrika ya Kati' },
    { code: 'TD', dialCode: '+235', name: 'Chad', nameSwahili: 'Chad' },
    { code: 'KM', dialCode: '+269', name: 'Comoros', nameSwahili: 'Komoro' },
    { code: 'CG', dialCode: '+242', name: 'Congo', nameSwahili: 'Kongo' },
    { code: 'CD', dialCode: '+243', name: 'DR Congo', nameSwahili: 'Jamhuri ya Kidemokrasia ya Kongo' },
    { code: 'CI', dialCode: '+225', name: "Côte d'Ivoire", nameSwahili: "Côte d'Ivoire" },
    { code: 'DJ', dialCode: '+253', name: 'Djibouti', nameSwahili: 'Jibuti' },
    { code: 'EG', dialCode: '+20', name: 'Egypt', nameSwahili: 'Misri' },
    { code: 'GQ', dialCode: '+240', name: 'Equatorial Guinea', nameSwahili: 'Guinea ya Ikweta' },
    { code: 'ER', dialCode: '+291', name: 'Eritrea', nameSwahili: 'Eritrea' },
    { code: 'SZ', dialCode: '+268', name: 'Eswatini', nameSwahili: 'Eswatini' },
    { code: 'ET', dialCode: '+251', name: 'Ethiopia', nameSwahili: 'Ethiopia' },
    { code: 'GA', dialCode: '+241', name: 'Gabon', nameSwahili: 'Gaboni' },
    { code: 'GM', dialCode: '+220', name: 'Gambia', nameSwahili: 'Gambia' },
    { code: 'GH', dialCode: '+233', name: 'Ghana', nameSwahili: 'Ghana' },
    { code: 'GN', dialCode: '+224', name: 'Guinea', nameSwahili: 'Guinea' },
    { code: 'GW', dialCode: '+245', name: 'Guinea-Bissau', nameSwahili: 'Guinea-Bisau' },
    { code: 'KE', dialCode: '+254', name: 'Kenya', nameSwahili: 'Kenya' },
    { code: 'LS', dialCode: '+266', name: 'Lesotho', nameSwahili: 'Lesoto' },
    { code: 'LR', dialCode: '+231', name: 'Liberia', nameSwahili: 'Liberia' },
    { code: 'LY', dialCode: '+218', name: 'Libya', nameSwahili: 'Libya' },
    { code: 'MG', dialCode: '+261', name: 'Madagascar', nameSwahili: 'Madagaska' },
    { code: 'MW', dialCode: '+265', name: 'Malawi', nameSwahili: 'Malawi' },
    { code: 'ML', dialCode: '+223', name: 'Mali', nameSwahili: 'Mali' },
    { code: 'MR', dialCode: '+222', name: 'Mauritania', nameSwahili: 'Moritania' },
    { code: 'MU', dialCode: '+230', name: 'Mauritius', nameSwahili: 'Morisi' },
    { code: 'MA', dialCode: '+212', name: 'Morocco', nameSwahili: 'Moroko' },
    { code: 'MZ', dialCode: '+258', name: 'Mozambique', nameSwahili: 'Msumbiji' },
    { code: 'NA', dialCode: '+264', name: 'Namibia', nameSwahili: 'Namibia' },
    { code: 'NE', dialCode: '+227', name: 'Niger', nameSwahili: 'Niger' },
    { code: 'NG', dialCode: '+234', name: 'Nigeria', nameSwahili: 'Nigeria' },
    { code: 'RW', dialCode: '+250', name: 'Rwanda', nameSwahili: 'Rwanda' },
    { code: 'ST', dialCode: '+239', name: 'São Tomé and Príncipe', nameSwahili: 'São Tomé na Príncipe' },
    { code: 'SN', dialCode: '+221', name: 'Senegal', nameSwahili: 'Senegali' },
    { code: 'SC', dialCode: '+248', name: 'Seychelles', nameSwahili: 'Shelisheli' },
    { code: 'SL', dialCode: '+232', name: 'Sierra Leone', nameSwahili: 'Sierra Leone' },
    { code: 'SO', dialCode: '+252', name: 'Somalia', nameSwahili: 'Somalia' },
    { code: 'ZA', dialCode: '+27', name: 'South Africa', nameSwahili: 'Afrika Kusini' },
    { code: 'SS', dialCode: '+211', name: 'South Sudan', nameSwahili: 'Sudan Kusini' },
    { code: 'SD', dialCode: '+249', name: 'Sudan', nameSwahili: 'Sudan' },
    { code: 'TZ', dialCode: '+255', name: 'Tanzania', nameSwahili: 'Tanzania' },
    { code: 'TG', dialCode: '+228', name: 'Togo', nameSwahili: 'Togo' },
    { code: 'TN', dialCode: '+216', name: 'Tunisia', nameSwahili: 'Tunisia' },
    { code: 'UG', dialCode: '+256', name: 'Uganda', nameSwahili: 'Uganda' },
    { code: 'ZM', dialCode: '+260', name: 'Zambia', nameSwahili: 'Zambia' },
    { code: 'ZW', dialCode: '+263', name: 'Zimbabwe', nameSwahili: 'Zimbabwe' },
];

type Props = {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
    language: 'en' | 'sw';
};

export function CountryCodePicker({ selectedCountry, onSelect, language }: Props) {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredCountries = React.useMemo(() => {
        if (!searchQuery.trim()) return COUNTRIES;
        const query = searchQuery.toLowerCase();
        return COUNTRIES.filter(
            (c) =>
                c.name.toLowerCase().includes(query) ||
                c.nameSwahili.toLowerCase().includes(query) ||
                c.dialCode.includes(query) ||
                c.code.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const handleSelect = (country: Country) => {
        onSelect(country);
        setModalVisible(false);
        setSearchQuery('');
    };

    const handleClose = () => {
        setModalVisible(false);
        setSearchQuery('');
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
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <View
                        style={styles.modalContent}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {language === 'en' ? 'Select Country' : 'Chagua Nchi'}
                            </Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={18} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={language === 'en' ? 'Search countries...' : 'Tafuta nchi...'}
                                placeholderTextColor="#999"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            keyboardShouldPersistTaps="handled"
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
        maxHeight: '70%',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 4,
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
