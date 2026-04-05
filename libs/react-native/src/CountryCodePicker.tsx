import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Country = {
    code: string;
    dialCode: string;
    name: string;
    nameSwahili: string;
};

export const COUNTRIES: Country[] = [
    // Common countries pinned at top
    { code: 'KE', dialCode: '+254', name: 'Kenya', nameSwahili: 'Kenya' },
    { code: 'TZ', dialCode: '+255', name: 'Tanzania', nameSwahili: 'Tanzania' },
    { code: 'UG', dialCode: '+256', name: 'Uganda', nameSwahili: 'Uganda' },
    { code: 'NG', dialCode: '+234', name: 'Nigeria', nameSwahili: 'Nigeria' },
    { code: 'ZA', dialCode: '+27', name: 'South Africa', nameSwahili: 'Afrika Kusini' },
    // Africa
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
    { code: 'RW', dialCode: '+250', name: 'Rwanda', nameSwahili: 'Rwanda' },
    { code: 'ST', dialCode: '+239', name: 'São Tomé and Príncipe', nameSwahili: 'São Tomé na Príncipe' },
    { code: 'SN', dialCode: '+221', name: 'Senegal', nameSwahili: 'Senegali' },
    { code: 'SC', dialCode: '+248', name: 'Seychelles', nameSwahili: 'Shelisheli' },
    { code: 'SL', dialCode: '+232', name: 'Sierra Leone', nameSwahili: 'Sierra Leone' },
    { code: 'SO', dialCode: '+252', name: 'Somalia', nameSwahili: 'Somalia' },
    { code: 'SS', dialCode: '+211', name: 'South Sudan', nameSwahili: 'Sudan Kusini' },
    { code: 'SD', dialCode: '+249', name: 'Sudan', nameSwahili: 'Sudan' },
    { code: 'TG', dialCode: '+228', name: 'Togo', nameSwahili: 'Togo' },
    { code: 'TN', dialCode: '+216', name: 'Tunisia', nameSwahili: 'Tunisia' },
    { code: 'ZM', dialCode: '+260', name: 'Zambia', nameSwahili: 'Zambia' },
    { code: 'ZW', dialCode: '+263', name: 'Zimbabwe', nameSwahili: 'Zimbabwe' },
    // Asia
    { code: 'AF', dialCode: '+93', name: 'Afghanistan', nameSwahili: 'Afghanistan' },
    { code: 'AM', dialCode: '+374', name: 'Armenia', nameSwahili: 'Armenia' },
    { code: 'AZ', dialCode: '+994', name: 'Azerbaijan', nameSwahili: 'Azerbaijan' },
    { code: 'BH', dialCode: '+973', name: 'Bahrain', nameSwahili: 'Bahrain' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh', nameSwahili: 'Bangladesh' },
    { code: 'BT', dialCode: '+975', name: 'Bhutan', nameSwahili: 'Bhutan' },
    { code: 'BN', dialCode: '+673', name: 'Brunei', nameSwahili: 'Brunei' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia', nameSwahili: 'Kambodia' },
    { code: 'CN', dialCode: '+86', name: 'China', nameSwahili: 'China' },
    { code: 'GE', dialCode: '+995', name: 'Georgia', nameSwahili: 'Georgia' },
    { code: 'IN', dialCode: '+91', name: 'India', nameSwahili: 'India' },
    { code: 'ID', dialCode: '+62', name: 'Indonesia', nameSwahili: 'Indonesia' },
    { code: 'IR', dialCode: '+98', name: 'Iran', nameSwahili: 'Iran' },
    { code: 'IQ', dialCode: '+964', name: 'Iraq', nameSwahili: 'Iraq' },
    { code: 'IL', dialCode: '+972', name: 'Israel', nameSwahili: 'Israeli' },
    { code: 'JP', dialCode: '+81', name: 'Japan', nameSwahili: 'Japani' },
    { code: 'JO', dialCode: '+962', name: 'Jordan', nameSwahili: 'Jordan' },
    { code: 'KZ', dialCode: '+7', name: 'Kazakhstan', nameSwahili: 'Kazakhstan' },
    { code: 'KW', dialCode: '+965', name: 'Kuwait', nameSwahili: 'Kuwait' },
    { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan', nameSwahili: 'Kyrgyzstan' },
    { code: 'LA', dialCode: '+856', name: 'Laos', nameSwahili: 'Laos' },
    { code: 'LB', dialCode: '+961', name: 'Lebanon', nameSwahili: 'Lebanon' },
    { code: 'MY', dialCode: '+60', name: 'Malaysia', nameSwahili: 'Malaysia' },
    { code: 'MV', dialCode: '+960', name: 'Maldives', nameSwahili: 'Maldives' },
    { code: 'MN', dialCode: '+976', name: 'Mongolia', nameSwahili: 'Mongolia' },
    { code: 'MM', dialCode: '+95', name: 'Myanmar', nameSwahili: 'Myanmar' },
    { code: 'NP', dialCode: '+977', name: 'Nepal', nameSwahili: 'Nepal' },
    { code: 'KP', dialCode: '+850', name: 'North Korea', nameSwahili: 'Korea Kaskazini' },
    { code: 'OM', dialCode: '+968', name: 'Oman', nameSwahili: 'Oman' },
    { code: 'PK', dialCode: '+92', name: 'Pakistan', nameSwahili: 'Pakistan' },
    { code: 'PS', dialCode: '+970', name: 'Palestine', nameSwahili: 'Palestina' },
    { code: 'PH', dialCode: '+63', name: 'Philippines', nameSwahili: 'Ufilipino' },
    { code: 'QA', dialCode: '+974', name: 'Qatar', nameSwahili: 'Qatar' },
    { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', nameSwahili: 'Saudi Arabia' },
    { code: 'SG', dialCode: '+65', name: 'Singapore', nameSwahili: 'Singapore' },
    { code: 'KR', dialCode: '+82', name: 'South Korea', nameSwahili: 'Korea Kusini' },
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka', nameSwahili: 'Sri Lanka' },
    { code: 'SY', dialCode: '+963', name: 'Syria', nameSwahili: 'Syria' },
    { code: 'TW', dialCode: '+886', name: 'Taiwan', nameSwahili: 'Taiwan' },
    { code: 'TJ', dialCode: '+992', name: 'Tajikistan', nameSwahili: 'Tajikistan' },
    { code: 'TH', dialCode: '+66', name: 'Thailand', nameSwahili: 'Thailand' },
    { code: 'TL', dialCode: '+670', name: 'Timor-Leste', nameSwahili: 'Timor-Leste' },
    { code: 'TR', dialCode: '+90', name: 'Turkey', nameSwahili: 'Uturuki' },
    { code: 'TM', dialCode: '+993', name: 'Turkmenistan', nameSwahili: 'Turkmenistan' },
    { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', nameSwahili: 'Falme za Kiarabu' },
    { code: 'UZ', dialCode: '+998', name: 'Uzbekistan', nameSwahili: 'Uzbekistan' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam', nameSwahili: 'Vietnam' },
    { code: 'YE', dialCode: '+967', name: 'Yemen', nameSwahili: 'Yemen' },
    // Europe
    { code: 'AL', dialCode: '+355', name: 'Albania', nameSwahili: 'Albania' },
    { code: 'AD', dialCode: '+376', name: 'Andorra', nameSwahili: 'Andorra' },
    { code: 'AT', dialCode: '+43', name: 'Austria', nameSwahili: 'Austria' },
    { code: 'BY', dialCode: '+375', name: 'Belarus', nameSwahili: 'Belarus' },
    { code: 'BE', dialCode: '+32', name: 'Belgium', nameSwahili: 'Ubelgiji' },
    { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina', nameSwahili: 'Bosnia na Herzegovina' },
    { code: 'BG', dialCode: '+359', name: 'Bulgaria', nameSwahili: 'Bulgaria' },
    { code: 'HR', dialCode: '+385', name: 'Croatia', nameSwahili: 'Croatia' },
    { code: 'CY', dialCode: '+357', name: 'Cyprus', nameSwahili: 'Kupro' },
    { code: 'CZ', dialCode: '+420', name: 'Czech Republic', nameSwahili: 'Jamhuri ya Czech' },
    { code: 'DK', dialCode: '+45', name: 'Denmark', nameSwahili: 'Denmark' },
    { code: 'EE', dialCode: '+372', name: 'Estonia', nameSwahili: 'Estonia' },
    { code: 'FI', dialCode: '+358', name: 'Finland', nameSwahili: 'Ufini' },
    { code: 'FR', dialCode: '+33', name: 'France', nameSwahili: 'Ufaransa' },
    { code: 'DE', dialCode: '+49', name: 'Germany', nameSwahili: 'Ujerumani' },
    { code: 'GR', dialCode: '+30', name: 'Greece', nameSwahili: 'Ugiriki' },
    { code: 'HU', dialCode: '+36', name: 'Hungary', nameSwahili: 'Hungaria' },
    { code: 'IS', dialCode: '+354', name: 'Iceland', nameSwahili: 'Iceland' },
    { code: 'IE', dialCode: '+353', name: 'Ireland', nameSwahili: 'Ireland' },
    { code: 'IT', dialCode: '+39', name: 'Italy', nameSwahili: 'Italia' },
    { code: 'LV', dialCode: '+371', name: 'Latvia', nameSwahili: 'Latvia' },
    { code: 'LI', dialCode: '+423', name: 'Liechtenstein', nameSwahili: 'Liechtenstein' },
    { code: 'LT', dialCode: '+370', name: 'Lithuania', nameSwahili: 'Lithuania' },
    { code: 'LU', dialCode: '+352', name: 'Luxembourg', nameSwahili: 'Luxembourg' },
    { code: 'MT', dialCode: '+356', name: 'Malta', nameSwahili: 'Malta' },
    { code: 'MD', dialCode: '+373', name: 'Moldova', nameSwahili: 'Moldova' },
    { code: 'MC', dialCode: '+377', name: 'Monaco', nameSwahili: 'Monaco' },
    { code: 'ME', dialCode: '+382', name: 'Montenegro', nameSwahili: 'Montenegro' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands', nameSwahili: 'Uholanzi' },
    { code: 'MK', dialCode: '+389', name: 'North Macedonia', nameSwahili: 'Macedonia ya Kaskazini' },
    { code: 'NO', dialCode: '+47', name: 'Norway', nameSwahili: 'Norway' },
    { code: 'PL', dialCode: '+48', name: 'Poland', nameSwahili: 'Poland' },
    { code: 'PT', dialCode: '+351', name: 'Portugal', nameSwahili: 'Ureno' },
    { code: 'RO', dialCode: '+40', name: 'Romania', nameSwahili: 'Romania' },
    { code: 'RU', dialCode: '+7', name: 'Russia', nameSwahili: 'Urusi' },
    { code: 'SM', dialCode: '+378', name: 'San Marino', nameSwahili: 'San Marino' },
    { code: 'RS', dialCode: '+381', name: 'Serbia', nameSwahili: 'Serbia' },
    { code: 'SK', dialCode: '+421', name: 'Slovakia', nameSwahili: 'Slovakia' },
    { code: 'SI', dialCode: '+386', name: 'Slovenia', nameSwahili: 'Slovenia' },
    { code: 'ES', dialCode: '+34', name: 'Spain', nameSwahili: 'Uhispania' },
    { code: 'SE', dialCode: '+46', name: 'Sweden', nameSwahili: 'Uswidi' },
    { code: 'CH', dialCode: '+41', name: 'Switzerland', nameSwahili: 'Uswisi' },
    { code: 'UA', dialCode: '+380', name: 'Ukraine', nameSwahili: 'Ukraine' },
    { code: 'GB', dialCode: '+44', name: 'United Kingdom', nameSwahili: 'Uingereza' },
    // Americas
    { code: 'AR', dialCode: '+54', name: 'Argentina', nameSwahili: 'Argentina' },
    { code: 'BS', dialCode: '+1-242', name: 'Bahamas', nameSwahili: 'Bahamas' },
    { code: 'BB', dialCode: '+1-246', name: 'Barbados', nameSwahili: 'Barbados' },
    { code: 'BZ', dialCode: '+501', name: 'Belize', nameSwahili: 'Belize' },
    { code: 'BO', dialCode: '+591', name: 'Bolivia', nameSwahili: 'Bolivia' },
    { code: 'BR', dialCode: '+55', name: 'Brazil', nameSwahili: 'Brazili' },
    { code: 'CA', dialCode: '+1', name: 'Canada', nameSwahili: 'Kanada' },
    { code: 'CL', dialCode: '+56', name: 'Chile', nameSwahili: 'Chile' },
    { code: 'CO', dialCode: '+57', name: 'Colombia', nameSwahili: 'Kolombia' },
    { code: 'CR', dialCode: '+506', name: 'Costa Rica', nameSwahili: 'Costa Rica' },
    { code: 'CU', dialCode: '+53', name: 'Cuba', nameSwahili: 'Kuba' },
    { code: 'DO', dialCode: '+1-809', name: 'Dominican Republic', nameSwahili: 'Jamhuri ya Dominika' },
    { code: 'EC', dialCode: '+593', name: 'Ecuador', nameSwahili: 'Ecuador' },
    { code: 'SV', dialCode: '+503', name: 'El Salvador', nameSwahili: 'El Salvador' },
    { code: 'GT', dialCode: '+502', name: 'Guatemala', nameSwahili: 'Guatemala' },
    { code: 'GY', dialCode: '+592', name: 'Guyana', nameSwahili: 'Guyana' },
    { code: 'HT', dialCode: '+509', name: 'Haiti', nameSwahili: 'Haiti' },
    { code: 'HN', dialCode: '+504', name: 'Honduras', nameSwahili: 'Honduras' },
    { code: 'JM', dialCode: '+1-876', name: 'Jamaica', nameSwahili: 'Jamaica' },
    { code: 'MX', dialCode: '+52', name: 'Mexico', nameSwahili: 'Meksiko' },
    { code: 'NI', dialCode: '+505', name: 'Nicaragua', nameSwahili: 'Nicaragua' },
    { code: 'PA', dialCode: '+507', name: 'Panama', nameSwahili: 'Panama' },
    { code: 'PY', dialCode: '+595', name: 'Paraguay', nameSwahili: 'Paraguay' },
    { code: 'PE', dialCode: '+51', name: 'Peru', nameSwahili: 'Peru' },
    { code: 'SR', dialCode: '+597', name: 'Suriname', nameSwahili: 'Suriname' },
    { code: 'TT', dialCode: '+1-868', name: 'Trinidad and Tobago', nameSwahili: 'Trinidad na Tobago' },
    { code: 'US', dialCode: '+1', name: 'United States', nameSwahili: 'Marekani' },
    { code: 'UY', dialCode: '+598', name: 'Uruguay', nameSwahili: 'Uruguay' },
    { code: 'VE', dialCode: '+58', name: 'Venezuela', nameSwahili: 'Venezuela' },
    // Oceania
    { code: 'AU', dialCode: '+61', name: 'Australia', nameSwahili: 'Australia' },
    { code: 'FJ', dialCode: '+679', name: 'Fiji', nameSwahili: 'Fiji' },
    { code: 'NZ', dialCode: '+64', name: 'New Zealand', nameSwahili: 'Nyuzilandi' },
    { code: 'PG', dialCode: '+675', name: 'Papua New Guinea', nameSwahili: 'Papua New Guinea' },
    { code: 'WS', dialCode: '+685', name: 'Samoa', nameSwahili: 'Samoa' },
    { code: 'TO', dialCode: '+676', name: 'Tonga', nameSwahili: 'Tonga' },
    { code: 'VU', dialCode: '+678', name: 'Vanuatu', nameSwahili: 'Vanuatu' },
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
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardAvoid}
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
                    </KeyboardAvoidingView>
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
    keyboardAvoid: {
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '60%',
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
