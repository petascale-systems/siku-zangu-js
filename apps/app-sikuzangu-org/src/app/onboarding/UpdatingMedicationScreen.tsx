import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { markOnboardingComplete } from '@siku-zangu/react-native';

export default function UpdatingMedicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const { upsertUser, isUpsertingUser, user } = useUser(userId);

  const medications = [
    { key: 'pain_relief', label: 'Pain Relief', icon: 'medkit-outline' },
    {
      key: 'herbal_supplement',
      label: 'Herbal Supplement',
      icon: 'leaf-outline',
    },
    { key: 'hormone_therapy', label: 'Hormone Therapy', icon: 'flask-outline' },
    { key: 'birth_control', label: 'Birth Control', icon: 'pill-outline' },
  ];

  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleSelection = (key: string) => {
    if (selectedMedications.includes(key)) {
      setSelectedMedications(
        selectedMedications.filter((item) => item !== key)
      );
    } else {
      setSelectedMedications([...selectedMedications, key]);
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

    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const currentMedicationLogs = user?.kv?.medication_logs || [];
      const newMedicationLogs = selectedMedications.map((medication) => ({
        medication,
        timestamp,
      }));

      const updateData: User = {
        kv: {
          selected_medications: selectedMedications,
          medication_logs: [...currentMedicationLogs, ...newMedicationLogs],
        },
      };
      await upsertUser(updateData);
      const onboardingMarked = await markOnboardingComplete(userId);
      if (onboardingMarked) {
        router.push({
          pathname: '/tabs/HomeScreen',
          params: {
            lang: language,
            userId: userId,
          },
        });
      } else {
        router.push({
          pathname: '/tabs/HomeScreen',
          params: {
            lang: language,
            userId: userId,
          },
        });
      }
    } catch (e: any) {
      const errorMessage =
        e.message ||
        (language === 'en'
          ? 'Failed to save medications'
          : 'Imeshindwa kuhifadhi dawa');
      Alert.alert(language === 'en' ? 'Error' : 'Hitilafu', errorMessage);
    } finally {
      setIsSaving(false);
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {language === 'en'
              ? 'What medication are you taking?'
              : 'Unatumia dawa gani?'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'en'
              ? 'Logging helps track effectiveness and avoid missed doses.'
              : 'Kurekodi kunasaidia kufuatilia ufanisi na kuepuka dozi zilizokosekana.'}
          </Text>
        </View>
        <View style={styles.grid}>
          {medications.map((item) => {
            const isSelected = selectedMedications.includes(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleSelection(item.key)}
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isSelected }}
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
        <TouchableOpacity
          style={[
            styles.nextButton,
            (isUpsertingUser || isSaving || !userId) &&
              styles.nextButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isUpsertingUser || isSaving || !userId}
          accessibilityLabel={
            language === 'en' ? 'Complete Setup' : 'Kamali Mipango'
          }
        >
          {isUpsertingUser || isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {language === 'en' ? 'COMPLETE SETUP' : 'KAMALI MIPANGO'}
            </Text>
          )}
        </TouchableOpacity>
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
    gap: 81,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: '600',
    marginTop: 51,
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
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: '#FD5A7E',
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: '#fff',
    fontWeight: '600',
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
