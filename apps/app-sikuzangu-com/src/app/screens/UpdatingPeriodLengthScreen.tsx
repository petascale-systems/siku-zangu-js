import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react';
import { UpdateUser } from '@siku-zangu/core';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdatingPeriodLength'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const UpdatingPeriodLengthScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const { upsertUser, isUpsertingUser } = useUser(userId);

  const [selectedLength, setSelectedLength] = useState<number>(7);
  const periodLengths = [3, 4, 5, 6, 7, 8, 9, 10];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert(
        language === 'en' ? 'Error' : 'Hitilafu',
        language === 'en'
          ? 'User ID not available'
          : 'Kitambulisho cha mtumiaji hakipatikani'
      );
      return;
    }

    try {
      const updateData: UpdateUser = {
        kv: {
          avg_period_length_days: selectedLength,
        },
      };

      console.log('UpdatingPeriodLength: Calling upsertUser with:', {
        userId,
        updateData,
      });

      await upsertUser(updateData);

      Alert.alert(
        language === 'en' ? 'Success' : 'Mafanikio',
        language === 'en'
          ? 'Period length saved successfully!'
          : 'Muda wa hedhi umehifadhiwa kwa mafanikio!',
        [
          {
            text: language === 'en' ? 'OK' : 'Sawa',
            onPress: () =>
              navigation.navigate('UpdatingCycleLength', {
                lang: language,
                userId,
              }),
          },
        ]
      );
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (language === 'en'
          ? 'Failed to save period length'
          : 'Imeshindwa kuhifadhi muda wa hedhi');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    }
  };

  const renderDayIndicator = (length: number) => {
    const isSelected = selectedLength === length;
    const dayDots = Array.from({ length }, (_, i) => (
      <View
        key={i}
        style={[
          styles.dayDot,
          isSelected && styles.dayDotSelected,
          i < length - 1 && styles.dayDotWithLine,
        ]}
      />
    ));

    return <View style={styles.dayIndicator}>{dayDots}</View>;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel={language === 'en' ? 'Go back' : 'Rudi nyuma'}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {language === 'en'
              ? 'How many days does your period last?'
              : 'Hedhi yako hudumu kwa siku ngapi?'}
          </Text>

          <Text style={styles.subtitle}>
            {language === 'en'
              ? 'Include every day with period flow, including spotting.'
              : 'Jumuisha kila siku yenye mtiririko wa hedhi, ikiwemo doa.'}
          </Text>
        </View>
        <View style={styles.visualIndicator}>
          <View style={styles.periodFlowContainer}>
            <Ionicons name="water-outline" size={20} color="#FD5A7E" />
            <Text style={styles.periodFlowText}>
              {language === 'en'
                ? 'Period flow days'
                : 'Siku za mtiririko wa hedhi'}
            </Text>
          </View>
        </View>
        <View style={styles.lengthContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {periodLengths.map((length) => (
              <TouchableOpacity
                key={length}
                style={[
                  styles.lengthCard,
                  selectedLength === length && styles.lengthCardSelected,
                ]}
                onPress={() => setSelectedLength(length)}
                accessibilityLabel={`${length} ${
                  language === 'en' ? 'days' : 'siku'
                }`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedLength === length }}
              >
                {renderDayIndicator(length)}
                <View style={styles.lengthContent}>
                  <Text
                    style={[
                      styles.lengthNumber,
                      selectedLength === length && styles.lengthNumberSelected,
                    ]}
                  >
                    {length}
                  </Text>
                  <Text
                    style={[
                      styles.lengthLabel,
                      selectedLength === length && styles.lengthLabelSelected,
                    ]}
                  >
                    {language === 'en' ? 'DAYS' : 'SIKU'}
                  </Text>
                </View>
                {selectedLength === length && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FD5A7E"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#645F5F"
            />
          </View>
          <Text style={styles.infoText}>
            {language === 'en'
              ? 'You can change your answer on your profile any time.'
              : 'Unaweza kubadilisha jibu lako kwenye wasifu wako wakati wowote.'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.nextButton,
            isUpsertingUser && styles.nextButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isUpsertingUser}
          accessibilityLabel={language === 'en' ? 'Next' : 'Ijayo'}
        >
          {isUpsertingUser ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {language === 'en' ? 'NEXT' : 'IJAYO'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 51,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '400',
    textAlign: 'center',
    color: '#645F5F',
    marginBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  visualIndicator: {
    alignItems: 'center',
    marginBottom: 30,
  },
  periodFlowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE1E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodFlowText: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#FD5A7E',
    marginLeft: 6,
  },
  lengthContainer: {
    marginBottom: 30,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  lengthCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lengthCardSelected: {
    backgroundColor: '#FFF5F2',
    borderColor: '#FD5A7E',
    shadowColor: '#FD5A7E',
    shadowOpacity: 0.2,
  },
  dayIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    height: 4,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginRight: 4,
  },
  dayDotSelected: {
    backgroundColor: '#FD5A7E',
  },
  dayDotWithLine: {
    width: 20,
    borderRadius: 2,
  },
  lengthContent: {
    alignItems: 'center',
  },
  lengthNumber: {
    fontSize: 32,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '700',
    color: '#CCCCCC',
    marginBottom: 4,
  },
  lengthNumberSelected: {
    color: '#FD5A7E',
  },
  lengthLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
  },
  lengthLabelSelected: {
    color: '#FD5A7E',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    marginTop: 40,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '400',
    color: '#645F5F',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#FD5A7E',
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '600',
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 30,
  },
  nextButtonDisabled: {
    backgroundColor: '#FFB6C1',
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontStyle: 'normal',
  },
});
