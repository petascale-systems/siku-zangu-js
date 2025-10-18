import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NavbarCard } from '../components/App-nav-component';

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;

export const InsightsScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const insets = useSafeAreaInsets();

  const handleBack = () => navigation.goBack();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights and Tips</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="brain" size={26} color="#FF4C7C" />
          </View>
          <Text style={styles.title}>Learn About Your Body</Text>
          <Text style={styles.description}>
            Explore the menstrual cycle stages, PMS vs PMDD, and when to consult a doctor.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View All Topics</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={[styles.card, styles.pinkCard]}>
          <View style={[styles.iconCircle, { backgroundColor: '#fff' }]}>
            <Ionicons name="male-female-outline" size={26} color="#FF4C7C" />
          </View>
          <Text style={[styles.title, { color: '#fff' }]}>
            Birth Control & Contraceptive Guide
          </Text>
          <Text style={[styles.description, { color: '#fff', opacity: 0.9 }]}>
            Compare birth control options and side effects.
          </Text>
          <TouchableOpacity style={[styles.button, styles.whiteButton]}>
            <Text style={[styles.buttonText, { color: '#FF4C7C' }]}>Browse Options</Text>
            <Ionicons name="arrow-forward" size={16} color="#FF4C7C" />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="flower-outline" size={26} color="#FF4C7C" />
          </View>
          <Text style={styles.title}>Lifestyle & Self-Care Tips</Text>
          <Text style={styles.description}>
            Learn nutrition tips, stress relief strategies, and self-care during your cycle.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Read Advice</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  pinkCard: {
    backgroundColor: '#F8BBD0',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F2',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FD5A7E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  whiteButton: {
    backgroundColor: '#fff',
  },
});
