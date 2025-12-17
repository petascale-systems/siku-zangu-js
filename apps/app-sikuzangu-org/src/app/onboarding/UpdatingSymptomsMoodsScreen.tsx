import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@siku-zangu/react';
import { User } from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdatingSymptomsMoodsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { upsertUser, isUpsertingUser, user } = useUser(userId);

  const symptoms = [
    {
      key: 'cramps',
      label: language === 'en' ? 'Cramps' : 'Maumivu',
      icon: 'fitness',
    },
    {
      key: 'fatigue',
      label: language === 'en' ? 'Fatigue' : 'Uchovu',
      icon: 'battery-dead',
    },
    {
      key: 'bloating',
      label: language === 'en' ? 'Bloating' : 'Kuvimba',
      icon: 'water',
    },
    {
      key: 'tender_breast',
      label: language === 'en' ? 'Tender breast' : 'Matiti yenye uchungu',
      icon: 'female',
    },
    {
      key: 'backache',
      label: language === 'en' ? 'Backache' : 'Maumivu ya mgongo',
      icon: 'body',
    },
    {
      key: 'headache',
      label: language === 'en' ? 'Headache' : 'Maumivu ya kichwa',
      icon: 'medkit',
    },
  ];

  const moods = [
    {
      key: 'happy',
      label: language === 'en' ? 'Happy' : 'Furaha',
      icon: 'happy-outline',
    },
    {
      key: 'sad',
      label: language === 'en' ? 'Sad' : 'Huzuni',
      icon: 'sad-outline',
    },
    {
      key: 'tired',
      label: language === 'en' ? 'Tired' : 'Kuchoka',
      icon: 'moon-outline',
    },
    {
      key: 'angry',
      label: language === 'en' ? 'Angry' : 'Hasira',
      icon: 'alert-circle-outline',
    },
    {
      key: 'in_love',
      label: language === 'en' ? 'In Love' : 'Mapenzi',
      icon: 'heart-outline',
    },
    {
      key: 'calm',
      label: language === 'en' ? 'Calm' : 'Utulivu',
      icon: 'leaf-outline',
    },
    {
      key: 'anxious',
      label: language === 'en' ? 'Anxious' : 'Wasiwasi',
      icon: 'alert-outline',
    },
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

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

  const toggleSelection = (
    list: string[],
    setList: (v: string[]) => void,
    key: string
  ) => {
    if (list.includes(key)) {
      setList(list.filter((item) => item !== key));
    } else {
      setList([...list, key]);
    }
  };

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
      const newSymptomLogs = selectedSymptoms.map((symptom) => ({
        symptom,
        timestamp,
      }));

      const newMoodLogs = selectedMoods.map((mood) => ({
        mood,
        timestamp,
      }));

      const updateData: User = {
        kv: {
          selected_symptoms: selectedSymptoms,
          selected_moods: selectedMoods,
          symptom_logs: [...currentSymptomLogs, ...newSymptomLogs],
          mood_logs: [...currentMoodLogs, ...newMoodLogs],
        },
      };
      await upsertUser(updateData);
      router.push({
        pathname: '/onboarding/UpdatingMedicationScreen',
        params: {
          lang: language,
          userId: userId,
        },
      });
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (language === 'en'
          ? 'Failed to save symptoms and moods'
          : 'Imeshindwa kuhifadhi dalili na hisia');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel={language === 'en' ? 'Go back' : 'Rudi nyuma'}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {language === 'en'
                ? 'How do you feel today?'
                : 'Unajisikiaje leo?'}
            </Text>
            <Text style={styles.subtitle}>
              {language === 'en'
                ? 'Your cycle can impact how you feel.'
                : 'Mzunguko wako unaweza kuathiri jinsi unavyohisi.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Select your symptoms'
                : 'Chagua dalili zako'}
            </Text>
            <View style={styles.grid}>
              {symptoms.map((item) => {
                const isSelected = selectedSymptoms.includes(item.key);
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() =>
                      toggleSelection(
                        selectedSymptoms,
                        setSelectedSymptoms,
                        item.key
                      )
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color={isSelected ? '#fff' : '#FD5A7E'}
                    />
                    <Text
                      style={[
                        styles.cardLabel,
                        isSelected && styles.cardLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Select your moods' : 'Chagua hisia zako'}
            </Text>
            <View style={styles.grid}>
              {moods.map((item) => {
                const isSelected = selectedMoods.includes(item.key);
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() =>
                      toggleSelection(selectedMoods, setSelectedMoods, item.key)
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color={isSelected ? '#fff' : '#FD5A7E'}
                    />
                    <Text
                      style={[
                        styles.cardLabel,
                        isSelected && styles.cardLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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
                ? 'You can update your symptoms and moods on your profile any time.'
                : 'Unaweza kusasisha dalili na hisia zako kwenye wasifu wako wakati wowote.'}
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
      </ScrollView>
    </View>
  );
}

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
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#FD5A7E',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#FD5A7E',
    borderColor: '#FD5A7E',
    shadowColor: '#FD5A7E',
    shadowOpacity: 0.2,
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
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
