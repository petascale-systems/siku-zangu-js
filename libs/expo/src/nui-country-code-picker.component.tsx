import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { inputTraits } from './input-traits';
import { colors, fields } from './theme';
import { typography } from './typography';

export type Country = {
    code: string;
    dialCode: string;
    name: string;
    nameSwahili: string;
};

/**
 * Digits in a national subscriber number, excluding the dial code.
 *
 * Only the countries whose length is a single fixed value are listed, and only
 * where that value is not in doubt. An entry that is wrong is worse than no
 * entry at all: the sign-in form uses this to hand focus from the phone field
 * to the PIN, so a length that is too short snatches the keyboard away
 * mid-number. Anything absent simply gets no hand-off.
 *
 * Kept beside {@link COUNTRIES} rather than as a field on it so ~200 rows do
 * not have to carry a mostly-empty column, and so the numbers that do exist
 * are reviewable in one place.
 */
export const NATIONAL_NUMBER_LENGTH: Readonly<Record<string, number>> = {
  // East Africa — the app's own audience. All 9, dialled 6xx/7xx.
  BI: 8,
  ET: 9,
  KE: 9,
  RW: 9,
  TZ: 9,
  UG: 9,
  ZM: 9,
  // Elsewhere, where the national number is a single fixed length.
  CA: 10,
  GB: 10,
  GH: 9,
  IN: 10,
  NG: 10,
  US: 10,
  ZA: 9,
};

/**
 * How many digits to expect for `country`, or `undefined` when the country has
 * no single answer. Callers decide what to do with "unknown" — the sign-in
 * form simply does not auto-advance.
 */
export const nationalNumberLength = (country: Country): number | undefined =>
  NATIONAL_NUMBER_LENGTH[country.code];

/**
 * Whether a phone field holding `value` holds a complete national number.
 *
 * Used to hand focus to the next field: iOS number pads have no return key, so
 * a numeric field cannot rely on `returnKeyType` and has to decide for itself
 * when it is done.
 *
 * Separate and pure so the rules below are testable without a keyboard.
 *
 * Two of them are easy to get wrong:
 *  - Separators do not count. "712 345 678" is nine digits, not eleven.
 *  - A trunk-prefixed number is NOT complete at the national length. People
 *    routinely type 0712345678 for a number whose national form is 712345678,
 *    and matching on length alone would take the keyboard away one digit
 *    early, every time. A national subscriber number never starts with 0, so
 *    a leading 0 means they are still typing the longer form.
 */
export const isPhoneNumberComplete = (
  value: string,
  expectedLength: number | undefined
): boolean => {
  if (expectedLength == null) return false;
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) return false;
  return digits.length === expectedLength;
};

export const COUNTRIES: Country[] = [
    { code: 'AF', dialCode: '+93', name: 'Afghanistan', nameSwahili: 'Afghanistan' },
    { code: 'AL', dialCode: '+355', name: 'Albania', nameSwahili: 'Albania' },
    { code: 'DZ', dialCode: '+213', name: 'Algeria', nameSwahili: 'Algeria' },
    { code: 'AD', dialCode: '+376', name: 'Andorra', nameSwahili: 'Andorra' },
    { code: 'AO', dialCode: '+244', name: 'Angola', nameSwahili: 'Angola' },
    { code: 'AR', dialCode: '+54', name: 'Argentina', nameSwahili: 'Argentina' },
    { code: 'AM', dialCode: '+374', name: 'Armenia', nameSwahili: 'Armenia' },
    { code: 'AU', dialCode: '+61', name: 'Australia', nameSwahili: 'Australia' },
    { code: 'AT', dialCode: '+43', name: 'Austria', nameSwahili: 'Austria' },
    { code: 'AZ', dialCode: '+994', name: 'Azerbaijan', nameSwahili: 'Azerbaijan' },
    { code: 'BS', dialCode: '+1-242', name: 'Bahamas', nameSwahili: 'Bahamas' },
    { code: 'BH', dialCode: '+973', name: 'Bahrain', nameSwahili: 'Bahrain' },
    { code: 'BD', dialCode: '+880', name: 'Bangladesh', nameSwahili: 'Bangladesh' },
    { code: 'BB', dialCode: '+1-246', name: 'Barbados', nameSwahili: 'Barbados' },
    { code: 'BY', dialCode: '+375', name: 'Belarus', nameSwahili: 'Belarus' },
    { code: 'BE', dialCode: '+32', name: 'Belgium', nameSwahili: 'Ubelgiji' },
    { code: 'BZ', dialCode: '+501', name: 'Belize', nameSwahili: 'Belize' },
    { code: 'BJ', dialCode: '+229', name: 'Benin', nameSwahili: 'Benin' },
    { code: 'BT', dialCode: '+975', name: 'Bhutan', nameSwahili: 'Bhutan' },
    { code: 'BO', dialCode: '+591', name: 'Bolivia', nameSwahili: 'Bolivia' },
    { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina', nameSwahili: 'Bosnia na Herzegovina' },
    { code: 'BW', dialCode: '+267', name: 'Botswana', nameSwahili: 'Botswana' },
    { code: 'BR', dialCode: '+55', name: 'Brazil', nameSwahili: 'Brazili' },
    { code: 'BN', dialCode: '+673', name: 'Brunei', nameSwahili: 'Brunei' },
    { code: 'BG', dialCode: '+359', name: 'Bulgaria', nameSwahili: 'Bulgaria' },
    { code: 'BF', dialCode: '+226', name: 'Burkina Faso', nameSwahili: 'Burkina Faso' },
    { code: 'BI', dialCode: '+257', name: 'Burundi', nameSwahili: 'Burundi' },
    { code: 'CV', dialCode: '+238', name: 'Cabo Verde', nameSwahili: 'Cabo Verde' },
    { code: 'KH', dialCode: '+855', name: 'Cambodia', nameSwahili: 'Kambodia' },
    { code: 'CM', dialCode: '+237', name: 'Cameroon', nameSwahili: 'Kameruni' },
    { code: 'CA', dialCode: '+1', name: 'Canada', nameSwahili: 'Kanada' },
    { code: 'CF', dialCode: '+236', name: 'Central African Republic', nameSwahili: 'Jamhuri ya Afrika ya Kati' },
    { code: 'TD', dialCode: '+235', name: 'Chad', nameSwahili: 'Chad' },
    { code: 'CL', dialCode: '+56', name: 'Chile', nameSwahili: 'Chile' },
    { code: 'CN', dialCode: '+86', name: 'China', nameSwahili: 'China' },
    { code: 'CO', dialCode: '+57', name: 'Colombia', nameSwahili: 'Kolombia' },
    { code: 'KM', dialCode: '+269', name: 'Comoros', nameSwahili: 'Komoro' },
    { code: 'CG', dialCode: '+242', name: 'Congo', nameSwahili: 'Kongo' },
    { code: 'CR', dialCode: '+506', name: 'Costa Rica', nameSwahili: 'Costa Rica' },
    { code: 'CI', dialCode: '+225', name: "Côte d'Ivoire", nameSwahili: "Côte d'Ivoire" },
    { code: 'HR', dialCode: '+385', name: 'Croatia', nameSwahili: 'Croatia' },
    { code: 'CU', dialCode: '+53', name: 'Cuba', nameSwahili: 'Kuba' },
    { code: 'CY', dialCode: '+357', name: 'Cyprus', nameSwahili: 'Kupro' },
    { code: 'CZ', dialCode: '+420', name: 'Czech Republic', nameSwahili: 'Jamhuri ya Czech' },
    { code: 'DK', dialCode: '+45', name: 'Denmark', nameSwahili: 'Denmark' },
    { code: 'DJ', dialCode: '+253', name: 'Djibouti', nameSwahili: 'Jibuti' },
    { code: 'DO', dialCode: '+1-809', name: 'Dominican Republic', nameSwahili: 'Jamhuri ya Dominika' },
    { code: 'CD', dialCode: '+243', name: 'DR Congo', nameSwahili: 'Jamhuri ya Kidemokrasia ya Kongo' },
    { code: 'EC', dialCode: '+593', name: 'Ecuador', nameSwahili: 'Ecuador' },
    { code: 'EG', dialCode: '+20', name: 'Egypt', nameSwahili: 'Misri' },
    { code: 'SV', dialCode: '+503', name: 'El Salvador', nameSwahili: 'El Salvador' },
    { code: 'GQ', dialCode: '+240', name: 'Equatorial Guinea', nameSwahili: 'Guinea ya Ikweta' },
    { code: 'ER', dialCode: '+291', name: 'Eritrea', nameSwahili: 'Eritrea' },
    { code: 'EE', dialCode: '+372', name: 'Estonia', nameSwahili: 'Estonia' },
    { code: 'SZ', dialCode: '+268', name: 'Eswatini', nameSwahili: 'Eswatini' },
    { code: 'ET', dialCode: '+251', name: 'Ethiopia', nameSwahili: 'Ethiopia' },
    { code: 'FJ', dialCode: '+679', name: 'Fiji', nameSwahili: 'Fiji' },
    { code: 'FI', dialCode: '+358', name: 'Finland', nameSwahili: 'Ufini' },
    { code: 'FR', dialCode: '+33', name: 'France', nameSwahili: 'Ufaransa' },
    { code: 'GA', dialCode: '+241', name: 'Gabon', nameSwahili: 'Gaboni' },
    { code: 'GM', dialCode: '+220', name: 'Gambia', nameSwahili: 'Gambia' },
    { code: 'GE', dialCode: '+995', name: 'Georgia', nameSwahili: 'Georgia' },
    { code: 'DE', dialCode: '+49', name: 'Germany', nameSwahili: 'Ujerumani' },
    { code: 'GH', dialCode: '+233', name: 'Ghana', nameSwahili: 'Ghana' },
    { code: 'GR', dialCode: '+30', name: 'Greece', nameSwahili: 'Ugiriki' },
    { code: 'GT', dialCode: '+502', name: 'Guatemala', nameSwahili: 'Guatemala' },
    { code: 'GN', dialCode: '+224', name: 'Guinea', nameSwahili: 'Guinea' },
    { code: 'GW', dialCode: '+245', name: 'Guinea-Bissau', nameSwahili: 'Guinea-Bisau' },
    { code: 'GY', dialCode: '+592', name: 'Guyana', nameSwahili: 'Guyana' },
    { code: 'HT', dialCode: '+509', name: 'Haiti', nameSwahili: 'Haiti' },
    { code: 'HN', dialCode: '+504', name: 'Honduras', nameSwahili: 'Honduras' },
    { code: 'HU', dialCode: '+36', name: 'Hungary', nameSwahili: 'Hungaria' },
    { code: 'IS', dialCode: '+354', name: 'Iceland', nameSwahili: 'Iceland' },
    { code: 'IN', dialCode: '+91', name: 'India', nameSwahili: 'India' },
    { code: 'ID', dialCode: '+62', name: 'Indonesia', nameSwahili: 'Indonesia' },
    { code: 'IR', dialCode: '+98', name: 'Iran', nameSwahili: 'Iran' },
    { code: 'IQ', dialCode: '+964', name: 'Iraq', nameSwahili: 'Iraq' },
    { code: 'IE', dialCode: '+353', name: 'Ireland', nameSwahili: 'Ireland' },
    { code: 'IL', dialCode: '+972', name: 'Israel', nameSwahili: 'Israeli' },
    { code: 'IT', dialCode: '+39', name: 'Italy', nameSwahili: 'Italia' },
    { code: 'JM', dialCode: '+1-876', name: 'Jamaica', nameSwahili: 'Jamaica' },
    { code: 'JP', dialCode: '+81', name: 'Japan', nameSwahili: 'Japani' },
    { code: 'JO', dialCode: '+962', name: 'Jordan', nameSwahili: 'Jordan' },
    { code: 'KZ', dialCode: '+7', name: 'Kazakhstan', nameSwahili: 'Kazakhstan' },
    { code: 'KE', dialCode: '+254', name: 'Kenya', nameSwahili: 'Kenya' },
    { code: 'KW', dialCode: '+965', name: 'Kuwait', nameSwahili: 'Kuwait' },
    { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan', nameSwahili: 'Kyrgyzstan' },
    { code: 'LA', dialCode: '+856', name: 'Laos', nameSwahili: 'Laos' },
    { code: 'LV', dialCode: '+371', name: 'Latvia', nameSwahili: 'Latvia' },
    { code: 'LB', dialCode: '+961', name: 'Lebanon', nameSwahili: 'Lebanon' },
    { code: 'LS', dialCode: '+266', name: 'Lesotho', nameSwahili: 'Lesoto' },
    { code: 'LR', dialCode: '+231', name: 'Liberia', nameSwahili: 'Liberia' },
    { code: 'LY', dialCode: '+218', name: 'Libya', nameSwahili: 'Libya' },
    { code: 'LI', dialCode: '+423', name: 'Liechtenstein', nameSwahili: 'Liechtenstein' },
    { code: 'LT', dialCode: '+370', name: 'Lithuania', nameSwahili: 'Lithuania' },
    { code: 'LU', dialCode: '+352', name: 'Luxembourg', nameSwahili: 'Luxembourg' },
    { code: 'MG', dialCode: '+261', name: 'Madagascar', nameSwahili: 'Madagaska' },
    { code: 'MW', dialCode: '+265', name: 'Malawi', nameSwahili: 'Malawi' },
    { code: 'MY', dialCode: '+60', name: 'Malaysia', nameSwahili: 'Malaysia' },
    { code: 'MV', dialCode: '+960', name: 'Maldives', nameSwahili: 'Maldives' },
    { code: 'ML', dialCode: '+223', name: 'Mali', nameSwahili: 'Mali' },
    { code: 'MT', dialCode: '+356', name: 'Malta', nameSwahili: 'Malta' },
    { code: 'MR', dialCode: '+222', name: 'Mauritania', nameSwahili: 'Moritania' },
    { code: 'MU', dialCode: '+230', name: 'Mauritius', nameSwahili: 'Morisi' },
    { code: 'MX', dialCode: '+52', name: 'Mexico', nameSwahili: 'Meksiko' },
    { code: 'MD', dialCode: '+373', name: 'Moldova', nameSwahili: 'Moldova' },
    { code: 'MC', dialCode: '+377', name: 'Monaco', nameSwahili: 'Monaco' },
    { code: 'MN', dialCode: '+976', name: 'Mongolia', nameSwahili: 'Mongolia' },
    { code: 'ME', dialCode: '+382', name: 'Montenegro', nameSwahili: 'Montenegro' },
    { code: 'MA', dialCode: '+212', name: 'Morocco', nameSwahili: 'Moroko' },
    { code: 'MZ', dialCode: '+258', name: 'Mozambique', nameSwahili: 'Msumbiji' },
    { code: 'MM', dialCode: '+95', name: 'Myanmar', nameSwahili: 'Myanmar' },
    { code: 'NA', dialCode: '+264', name: 'Namibia', nameSwahili: 'Namibia' },
    { code: 'NP', dialCode: '+977', name: 'Nepal', nameSwahili: 'Nepal' },
    { code: 'NL', dialCode: '+31', name: 'Netherlands', nameSwahili: 'Uholanzi' },
    { code: 'NZ', dialCode: '+64', name: 'New Zealand', nameSwahili: 'Nyuzilandi' },
    { code: 'NI', dialCode: '+505', name: 'Nicaragua', nameSwahili: 'Nicaragua' },
    { code: 'NE', dialCode: '+227', name: 'Niger', nameSwahili: 'Niger' },
    { code: 'NG', dialCode: '+234', name: 'Nigeria', nameSwahili: 'Nigeria' },
    { code: 'KP', dialCode: '+850', name: 'North Korea', nameSwahili: 'Korea Kaskazini' },
    { code: 'MK', dialCode: '+389', name: 'North Macedonia', nameSwahili: 'Macedonia ya Kaskazini' },
    { code: 'NO', dialCode: '+47', name: 'Norway', nameSwahili: 'Norway' },
    { code: 'OM', dialCode: '+968', name: 'Oman', nameSwahili: 'Oman' },
    { code: 'PK', dialCode: '+92', name: 'Pakistan', nameSwahili: 'Pakistan' },
    { code: 'PS', dialCode: '+970', name: 'Palestine', nameSwahili: 'Palestina' },
    { code: 'PA', dialCode: '+507', name: 'Panama', nameSwahili: 'Panama' },
    { code: 'PG', dialCode: '+675', name: 'Papua New Guinea', nameSwahili: 'Papua New Guinea' },
    { code: 'PY', dialCode: '+595', name: 'Paraguay', nameSwahili: 'Paraguay' },
    { code: 'PE', dialCode: '+51', name: 'Peru', nameSwahili: 'Peru' },
    { code: 'PH', dialCode: '+63', name: 'Philippines', nameSwahili: 'Ufilipino' },
    { code: 'PL', dialCode: '+48', name: 'Poland', nameSwahili: 'Poland' },
    { code: 'PT', dialCode: '+351', name: 'Portugal', nameSwahili: 'Ureno' },
    { code: 'QA', dialCode: '+974', name: 'Qatar', nameSwahili: 'Qatar' },
    { code: 'RO', dialCode: '+40', name: 'Romania', nameSwahili: 'Romania' },
    { code: 'RU', dialCode: '+7', name: 'Russia', nameSwahili: 'Urusi' },
    { code: 'RW', dialCode: '+250', name: 'Rwanda', nameSwahili: 'Rwanda' },
    { code: 'WS', dialCode: '+685', name: 'Samoa', nameSwahili: 'Samoa' },
    { code: 'SM', dialCode: '+378', name: 'San Marino', nameSwahili: 'San Marino' },
    { code: 'ST', dialCode: '+239', name: 'São Tomé and Príncipe', nameSwahili: 'São Tomé na Príncipe' },
    { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', nameSwahili: 'Saudi Arabia' },
    { code: 'SN', dialCode: '+221', name: 'Senegal', nameSwahili: 'Senegali' },
    { code: 'RS', dialCode: '+381', name: 'Serbia', nameSwahili: 'Serbia' },
    { code: 'SC', dialCode: '+248', name: 'Seychelles', nameSwahili: 'Shelisheli' },
    { code: 'SL', dialCode: '+232', name: 'Sierra Leone', nameSwahili: 'Sierra Leone' },
    { code: 'SG', dialCode: '+65', name: 'Singapore', nameSwahili: 'Singapore' },
    { code: 'SK', dialCode: '+421', name: 'Slovakia', nameSwahili: 'Slovakia' },
    { code: 'SI', dialCode: '+386', name: 'Slovenia', nameSwahili: 'Slovenia' },
    { code: 'SO', dialCode: '+252', name: 'Somalia', nameSwahili: 'Somalia' },
    { code: 'ZA', dialCode: '+27', name: 'South Africa', nameSwahili: 'Afrika Kusini' },
    { code: 'KR', dialCode: '+82', name: 'South Korea', nameSwahili: 'Korea Kusini' },
    { code: 'SS', dialCode: '+211', name: 'South Sudan', nameSwahili: 'Sudan Kusini' },
    { code: 'ES', dialCode: '+34', name: 'Spain', nameSwahili: 'Uhispania' },
    { code: 'LK', dialCode: '+94', name: 'Sri Lanka', nameSwahili: 'Sri Lanka' },
    { code: 'SD', dialCode: '+249', name: 'Sudan', nameSwahili: 'Sudan' },
    { code: 'SR', dialCode: '+597', name: 'Suriname', nameSwahili: 'Suriname' },
    { code: 'SE', dialCode: '+46', name: 'Sweden', nameSwahili: 'Uswidi' },
    { code: 'CH', dialCode: '+41', name: 'Switzerland', nameSwahili: 'Uswisi' },
    { code: 'SY', dialCode: '+963', name: 'Syria', nameSwahili: 'Syria' },
    { code: 'TW', dialCode: '+886', name: 'Taiwan', nameSwahili: 'Taiwan' },
    { code: 'TJ', dialCode: '+992', name: 'Tajikistan', nameSwahili: 'Tajikistan' },
    { code: 'TZ', dialCode: '+255', name: 'Tanzania', nameSwahili: 'Tanzania' },
    { code: 'TH', dialCode: '+66', name: 'Thailand', nameSwahili: 'Thailand' },
    { code: 'TL', dialCode: '+670', name: 'Timor-Leste', nameSwahili: 'Timor-Leste' },
    { code: 'TG', dialCode: '+228', name: 'Togo', nameSwahili: 'Togo' },
    { code: 'TO', dialCode: '+676', name: 'Tonga', nameSwahili: 'Tonga' },
    { code: 'TT', dialCode: '+1-868', name: 'Trinidad and Tobago', nameSwahili: 'Trinidad na Tobago' },
    { code: 'TN', dialCode: '+216', name: 'Tunisia', nameSwahili: 'Tunisia' },
    { code: 'TR', dialCode: '+90', name: 'Turkey', nameSwahili: 'Uturuki' },
    { code: 'TM', dialCode: '+993', name: 'Turkmenistan', nameSwahili: 'Turkmenistan' },
    { code: 'UG', dialCode: '+256', name: 'Uganda', nameSwahili: 'Uganda' },
    { code: 'UA', dialCode: '+380', name: 'Ukraine', nameSwahili: 'Ukraine' },
    { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', nameSwahili: 'Falme za Kiarabu' },
    { code: 'GB', dialCode: '+44', name: 'United Kingdom', nameSwahili: 'Uingereza' },
    { code: 'US', dialCode: '+1', name: 'United States', nameSwahili: 'Marekani' },
    { code: 'UY', dialCode: '+598', name: 'Uruguay', nameSwahili: 'Uruguay' },
    { code: 'UZ', dialCode: '+998', name: 'Uzbekistan', nameSwahili: 'Uzbekistan' },
    { code: 'VU', dialCode: '+678', name: 'Vanuatu', nameSwahili: 'Vanuatu' },
    { code: 'VE', dialCode: '+58', name: 'Venezuela', nameSwahili: 'Venezuela' },
    { code: 'VN', dialCode: '+84', name: 'Vietnam', nameSwahili: 'Vietnam' },
    { code: 'YE', dialCode: '+967', name: 'Yemen', nameSwahili: 'Yemen' },
    { code: 'ZM', dialCode: '+260', name: 'Zambia', nameSwahili: 'Zambia' },
    { code: 'ZW', dialCode: '+263', name: 'Zimbabwe', nameSwahili: 'Zimbabwe' },
];

type Props = {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
    language: 'en' | 'sw';
};

export function NUICountryCodePicker({ selectedCountry, onSelect, language }: Props) {
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
                                    {...inputTraits.search}
                                    style={styles.searchInput}
                                    placeholder={language === 'en' ? 'Search countries...' : 'Tafuta nchi...'}
                                    placeholderTextColor={colors.text.placeholder}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
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
        borderRightColor: colors.border.default,
        gap: 4,
    },
    dialCode: {
      ...typography.body,
        color: colors.text.primary,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardAvoid: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface.card,
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
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border.subtle,
    },
    modalTitle: {
      ...typography.headingSm,
        fontWeight: '600',
        color: colors.text.primary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.surface.muted,
        borderRadius: 10,
        gap: 8,
    },
    searchInput: {
        ...fields.compact,
      ...typography.body,
        flex: 1,
        color: colors.text.primary,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border.subtle,
    },
    selectedItem: {
        backgroundColor: colors.surface.tint,
    },
    countryName: {
      ...typography.body,
        flex: 1,
        color: colors.text.primary,
        fontWeight: '500',
    },
    countryDialCode: {
      ...typography.body,
        color: colors.text.secondary,
        marginRight: 12,
    },
});
