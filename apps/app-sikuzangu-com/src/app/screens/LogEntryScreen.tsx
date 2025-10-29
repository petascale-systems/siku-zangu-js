import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessToken, useUser } from '@siku-zangu/react';
import { UpdateUser } from '@siku-zangu/core';
import { NavbarCard } from '../components/App-nav-component';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'AddLog'>;

export const LogEntryScreen = ({ navigation, route }: Props) => {
  const { user } = useAccessToken();
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const { upsertUser, isUpsertingUser } = useUser(userId);
  const insets = useSafeAreaInsets();

  const symptoms = [
    { key: 'cramps', label: language === 'en' ? 'Cramps' : 'Maumivu', icon: '🔥', color: '#FFE4E1' },
    { key: 'fatigue', label: language === 'en' ? 'Fatigue' : 'Uchovu', icon: '😴', color: '#E6E6FA' },
    { key: 'bloating', label: language === 'en' ? 'Bloating' : 'Kuvimba', icon: '💧', color: '#E0F7FA' },
    { key: 'tender_breast', label: language === 'en' ? 'Tender breast' : 'Matiti', icon: '🤱', color: '#FCE4EC' },
    { key: 'backache', label: language === 'en' ? 'Backache' : 'Mgongo', icon: '🔴', color: '#FFEBEE' },
    { key: 'headache', label: language === 'en' ? 'Headache' : 'Kichwa', icon: '😵', color: '#FFF3E0' },
  ];

  const moods = [
    { key: 'happy', label: language === 'en' ? 'Happy' : 'Furaha', emoji: '😊', color: '#FFF9C4' },
    { key: 'sad', label: language === 'en' ? 'Sad' : 'Huzuni', emoji: '😢', color: '#E1F5FE' },
    { key: 'tired', label: language === 'en' ? 'Tired' : 'Kuchoka', emoji: '😴', color: '#F3E5F5' },
    { key: 'in_love', label: language === 'en' ? 'In Love' : 'Mapenzi', emoji: '😍', color: '#FCE4EC' },
    { key: 'calm', label: language === 'en' ? 'Calm' : 'Utulivu', emoji: '😌', color: '#E8F5E9' },
    { key: 'curious', label: language === 'en' ? 'Curious' : 'Udadisi', emoji: '🤔', color: '#FFF3E0' },
  ];

  const medications = [
    { key: 'pain_relief', label: language === 'en' ? 'Pain Relief' : 'Dawa ya maumivu', icon: '💊', color: '#FFEBEE' },
    { key: 'herbal_supplement', label: language === 'en' ? 'Herbal Supplement' : 'Virutubisho', icon: '🌿', color: '#E8F5E9' },
    { key: 'hormone_therapy', label: language === 'en' ? 'Hormone Therapy' : 'Tiba ya homoni', icon: '💉', color: '#E1F5FE' },
    { key: 'birth_control', label: language === 'en' ? 'Birth Control' : 'Kupunguza uzazi', icon: '💊', color: '#F3E5F5' },
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [lastPeriodDays, setLastPeriodDays] = useState<number>(7);
  const [avgCycleDays, setAvgCycleDays] = useState<number>(28);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Initialize state from user data
  React.useEffect(() => {
    if (user?.kv) {
      // Parse arrays if they're strings, otherwise use as-is
      const symptoms = typeof user.kv.selected_symptoms === 'string'
        ? JSON.parse(user.kv.selected_symptoms)
        : (user.kv.selected_symptoms || []);

      const moods = typeof user.kv.selected_moods === 'string'
        ? JSON.parse(user.kv.selected_moods)
        : (user.kv.selected_moods || []);

      const meds = typeof user.kv.selected_medications === 'string'
        ? JSON.parse(user.kv.selected_medications)
        : (user.kv.selected_medications || []);

      setSelectedSymptoms(symptoms);
      setSelectedMoods(moods);
      setSelectedMedications(meds);
      setLastPeriodDays(user.kv.avg_period_length_days || 7);
      setAvgCycleDays(user.kv.avg_cycle_length_days || 28);
    }
  }, [user]);

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

  const toggleSelection = (list: string[], setList: (v: string[]) => void, key: string) => {
    if (list.includes(key)) {
      setList(list.filter((item) => item !== key));
    } else {
      setList([...list, key]);
    }
  };

  const handleBack = () => navigation.goBack();

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
      const timestamp = new Date().toISOString();
      const currentSymptomLogs = user?.kv.symptom_logs || [];
      const currentMoodLogs = user?.kv.mood_logs || [];
      const currentMedicationLogs = user?.kv.medication_logs || [];


      const newSymptomLogs = selectedSymptoms.map(symptom => ({
        symptom,
        timestamp,
      }));

      const newMoodLogs = selectedMoods.map(mood => ({
        mood,
        timestamp,
      }));

      const newMedicationLogs = selectedMedications.map(medication => ({
        medication,
        timestamp,
      }));

      const updateData: UpdateUser = {
        kv: {
          selected_symptoms: selectedSymptoms,
          selected_moods: selectedMoods,
          selected_medications: selectedMedications,
          avg_period_length_days: lastPeriodDays,
          avg_cycle_length_days: avgCycleDays,
          symptom_logs: [...currentSymptomLogs, ...newSymptomLogs],
          mood_logs: [...currentMoodLogs, ...newMoodLogs],
          medication_logs: [...currentMedicationLogs, ...newMedicationLogs],
        },
      };

      console.log('LogEntry: Calling upsertUser with:', {
        userId,
        updateData,
      });

      await upsertUser(updateData);

      Alert.alert(
        language === 'en' ? 'Success' : 'Mafanikio',
        language === 'en'
          ? 'Your log has been saved!'
          : 'Rekodi yako imehifadhiwa kwa mafanikio!',
      );
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (language === 'en'
          ? 'Failed to save log'
          : 'Imeshindwa kuhifadhi rekodi');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Log Entry' : 'Rekodi'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Log your symptoms' : 'Rekodi dalili zako'}
            </Text>
            <View style={styles.card}>
              <View style={styles.symptomsGrid}>
                {symptoms.map((item) => {
                  const isSelected = selectedSymptoms.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.symptomCard,
                        { backgroundColor: item.color },
                        isSelected && styles.symptomCardSelected,
                      ]}
                      onPress={() =>
                        toggleSelection(selectedSymptoms, setSelectedSymptoms, item.key)
                      }
                    >
                      <Text style={styles.symptomIcon}>{item.icon}</Text>
                      <Text style={[styles.symptomLabel, isSelected && styles.symptomLabelSelected]}>
                        {item.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color="#FF4C7C" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Cycle Details' : 'Maelezo ya Mzunguko'}
            </Text>
            <View style={styles.card}>
              <View style={styles.cycleDetailCard}>
                <Text style={styles.cycleDetailLabel}>
                  {language === 'en'
                    ? 'Last Period lasted for?'
                    : 'Hedhi ya mwisho ilidumu kwa?'}
                </Text>
                <View style={styles.daysSelector}>
                  {[5, 6, 7, 8, 9].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCircle,
                        lastPeriodDays === day && styles.dayCircleSelected,
                      ]}
                      onPress={() => setLastPeriodDays(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          lastPeriodDays === day && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.cycleDetailCard}>
                <Text style={styles.cycleDetailLabel}>
                  {language === 'en'
                    ? 'My average menstrual cycle is?'
                    : 'Mzunguko wangu wa wastani ni?'}
                </Text>
                <View style={styles.daysSelector}>
                  {[26, 27, 28, 29, 30].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCircle,
                        avgCycleDays === day && styles.dayCircleSelected,
                      ]}
                      onPress={() => setAvgCycleDays(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          avgCycleDays === day && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Medication' : 'Dawa'}
            </Text>
            <View style={styles.card}>
              <View style={styles.medicationList}>
                {medications.map((item) => {
                  const isSelected = selectedMedications.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.medicationCard,
                        { backgroundColor: item.color },
                        isSelected && styles.medicationCardSelected,
                      ]}
                      onPress={() =>
                        toggleSelection(selectedMedications, setSelectedMedications, item.key)
                      }
                    >
                      <Text style={styles.medicationIcon}>{item.icon}</Text>
                      <Text style={styles.medicationLabel}>{item.label}</Text>
                      {isSelected && (
                        <View style={styles.medicationCheck}>
                          <Ionicons name="checkmark-circle" size={20} color="#FF4C7C" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Log your mood' : 'Rekodi hisia yako'}
            </Text>
            <View style={styles.card}>
              <View style={styles.moodsGrid}>
                {moods.map((item) => {
                  const isSelected = selectedMoods.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.moodCard,
                        { backgroundColor: item.color },
                        isSelected && styles.moodCardSelected,
                      ]}
                      onPress={() =>
                        toggleSelection(selectedMoods, setSelectedMoods, item.key)
                      }
                    >
                      <Text style={styles.moodEmoji}>{item.emoji}</Text>
                      <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isUpsertingUser && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isUpsertingUser}
          >
            {isUpsertingUser ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>
                  {language === 'en' ? 'SAVE LOG' : 'HIFADHI REKODI'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <NavbarCard navigation={navigation} language={language} userId={userId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FD5A7E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomCardSelected: {
    borderColor: '#FF4C7C',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  symptomIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  symptomLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  symptomLabelSelected: {
    fontWeight: '700',
    color: '#FF4C7C',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  cycleDetailCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cycleDetailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  daysSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCircleSelected: {
    backgroundColor: '#FFE4EC',
    borderColor: '#FF4C7C',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  dayTextSelected: {
    color: '#FF4C7C',
    fontWeight: '700',
  },
  medicationList: {
    gap: 12,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  medicationCardSelected: {
    borderColor: '#FF4C7C',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  medicationIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  medicationLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontWeight: '500',
  },
  medicationCheck: {
    position: 'absolute',
    right: 12,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodCardSelected: {
    borderColor: '#FF4C7C',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  moodLabelSelected: {
    fontWeight: '700',
    color: '#FF4C7C',
  },
  saveButton: {
    backgroundColor: '#FF4C7C',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#FFB6C1',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});