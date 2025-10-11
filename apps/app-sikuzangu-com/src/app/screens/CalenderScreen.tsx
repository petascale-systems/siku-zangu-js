import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NavbarCard } from '../components/App-nav-component';

type Props = NativeStackScreenProps<RootStackParamList, 'Calender'>;

const RADIUS = 120;
const DAYS_IN_MONTH = 31;
const CENTER_X = 180;
const CENTER_Y = 180;

// Example data
const periodDays = [1, 2, 3, 4, 5, 6];
const fertilityDays = [10, 11, 12, 13, 14, 15];
const ovulationDays = [17, 18];
const predictedDays = [29, 30, 31];

const getCoordinates = (day: number, radius = RADIUS) => {
  const angle = ((day - 1) / DAYS_IN_MONTH) * (2 * Math.PI) - Math.PI / 2;
  const x = CENTER_X + radius * Math.cos(angle);
  const y = CENTER_Y + radius * Math.sin(angle);
  return { x, y, angle };
};

export const CalenderScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const handleBack = () => navigation.goBack();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF5F2' }}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel={language === 'en' ? 'Back' : 'Rudi'}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Calendar' : 'Kalenda'}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.month}>
            {language === 'en' ? 'August 2025' : 'Agosti 2025'}
          </Text>
          <View style={styles.calendarContainer}>
            <Svg height="360" width="360">
              <SvgText
                x={CENTER_X}
                y={CENTER_Y}
                textAnchor="middle"
                fontSize="22"
                fontWeight="600"
                fill="#999"
              >
                Aug
              </SvgText>

              {Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
                const day = i + 1;
                const { x, y, angle } = getCoordinates(day);
                let fill = '#fff';
                let stroke = '#e0e0e0';
                let strokeDasharray: string | null = null;
                let sequenceNum: number | null = null;

                if (periodDays.includes(day)) {
                  fill = '#FF4C7C';
                  stroke = '#FF4C7C';
                  sequenceNum = periodDays.indexOf(day) + 1;
                } else if (fertilityDays.includes(day)) {
                  fill = '#1ABC9C';
                  stroke = '#1ABC9C';
                } else if (ovulationDays.includes(day)) {
                  fill = '#9B59B6';
                  stroke = '#9B59B6';
                } else if (predictedDays.includes(day)) {
                  fill = '#fff';
                  stroke = '#bbb';
                  strokeDasharray = '4 4';
                  sequenceNum = predictedDays.indexOf(day) + 1;
                }

                const badgeRadius = RADIUS + 20;
                const badgeX = CENTER_X + badgeRadius * Math.cos(angle);
                const badgeY = CENTER_Y + badgeRadius * Math.sin(angle);

                // @ts-ignore
                return (
                  <React.Fragment key={day}>
                    <Circle
                      cx={x}
                      cy={y}
                      r={selectedDay === day ? 19 : 16}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={selectedDay === day ? 3 : 2.5}
                      strokeDasharray={strokeDasharray}
                    />
                    <SvgText
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="500"
                      fill={fill === '#fff' ? '#333' : '#fff'}
                    >
                      {day}
                    </SvgText>

                    {sequenceNum && (
                      <>
                        <Circle
                          cx={badgeX}
                          cy={badgeY}
                          r="8"
                          fill={stroke === '#bbb' ? '#fff' : stroke}
                          stroke={stroke}
                          strokeWidth="1.5"
                          strokeDasharray={strokeDasharray}
                        />
                        <SvgText
                          x={badgeX}
                          y={badgeY + 3}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="600"
                          fill={stroke === '#bbb' ? '#999' : '#fff'}
                        >
                          {sequenceNum}
                        </SvgText>
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>

          <View style={styles.legend}>
            <LegendItem
              color="#FF4C7C"
              label={language === 'en' ? 'Period' : 'Hedhi'}
            />
            <LegendItem
              color="#9B59B6"
              label={language === 'en' ? 'Ovulation' : 'Ovulation'}
            />
            <LegendItem
              color="#1ABC9C"
              label={language === 'en' ? 'Fertility' : 'Uzazi'}
            />
            <LegendItem
              color="#999"
              label={language === 'en' ? 'Predicted' : 'Inatabiriwa'}
              dotted
            />
          </View>
        </View>

        <View style={styles.row}>
          <InfoCard
            title={language === 'en' ? 'Cycle Length' : 'Urefu wa Mzunguko'}
            value="28"
            unit={language === 'en' ? 'days' : 'siku'}
            icon="calendar-outline"
            iconColor="#FF4C7C"
            graph
          />
          <InfoCard
            title={language === 'en' ? 'Next Period' : 'Hedhi Inayofuata'}
            value={language === 'en' ? 'in 6 days' : 'baada ya siku 6'}
            icon="water-outline"
            iconColor="#1ABC9C"
          />
        </View>

        <PhaseCard
          title={language === 'en' ? 'Ovulation Phase' : 'Awamu ya Ovulation'}
          date={language === 'en' ? 'Expected on Aug 14' : 'Inatarajiwa Agosti 14'}
          description={
            language === 'en'
              ? 'Your body releases an egg — the most fertile day in your cycle.'
              : 'Mwili wako hutoa yai — siku ya uzazi zaidi katika mzunguko wako.'
          }
          color="#9B59B6"
          icon="flower-outline"
        />

        <PhaseCard
          title={language === 'en' ? 'Fertility Phase' : 'Awamu ya Uzazi'}
          date={language === 'en' ? 'Aug 10 – Aug 15' : 'Agosti 10 - Agosti 15'}
          description={
            language === 'en'
              ? 'Best chance of getting pregnant.'
              : 'Nafasi bora ya kupata mimba.'
          }
          color="#1ABC9C"
          icon="sparkles-outline"
        />

        <TouchableOpacity
          style={styles.trackingCard}
          activeOpacity={0.8}
          accessibilityLabel={language === 'en' ? 'Track Cycle' : 'Fuatilia Mzunguko'}
          accessibilityRole="button"
        >
          <View style={styles.trackingContent}>
            <View style={styles.bulbIcon}>
              <Ionicons name="bulb" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trackingTitle}>
                {language === 'en' ? 'High accuracy' : 'Usahihi wa juu'}
              </Text>
              <Text style={styles.trackingText}>
                {language === 'en' ? 'Best time for tracking' : 'Wakati bora wa kufuatilia'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#3E3E3E" />
        </TouchableOpacity>
      </ScrollView>

      <NavbarCard navigation={navigation} language={language} userId={userId} />
    </View>
  );
};

interface LegendItemProps {
  color: string;
  label: string;
  dotted?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, dotted }) => (
  <View style={styles.legendItem}>
    <View
      style={[
        styles.legendDot,
        {
          borderColor: color,
          borderStyle: dotted ? 'dashed' : 'solid',
          backgroundColor: dotted ? '#fff' : color,
        },
      ]}
    />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

interface InfoCardProps {
  title: string;
  value: string;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  graph?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
                                             title,
                                             value,
                                             unit,
                                             icon,
                                             iconColor,
                                             graph,
                                           }) => (
  <View style={styles.infoCard}>
    {icon && (
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
    )}
    <Text style={styles.cardTitle}>{title}</Text>
    {graph ? (
      <>
        <Text style={[styles.cycleValue, { color: iconColor }]}>{value}</Text>
        <Text style={styles.cycleUnit}>{unit}</Text>
        <View style={[styles.graphLine, { backgroundColor: iconColor }]} />
      </>
    ) : (
      <>
        <Text style={styles.nextPeriod}>{value}</Text>
        {icon && (
          <View style={styles.dropContainer}>
            <Ionicons name="water" size={14} color={iconColor} />
            <Ionicons name="water" size={14} color={iconColor} />
            <Ionicons name="water" size={14} color={iconColor} />
          </View>
        )}
      </>
    )}
  </View>
);

interface PhaseCardProps {
  title: string;
  date: string;
  description: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PhaseCard: React.FC<PhaseCardProps> = ({
                                               title,
                                               date,
                                               description,
                                               color,
                                               icon,
                                             }) => (
  <View style={styles.phaseCard}>
    <View style={[styles.phaseAccent, { backgroundColor: color }]} />
    <View style={styles.phaseHeader}>
      <View style={[styles.phaseIconBg, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.phaseTitle, { color }]}>{title}</Text>
    </View>
    <Text style={styles.phaseDate}>{date}</Text>
    <Text style={styles.phaseDesc}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F2',
    padding: 10,
  },
  header: {
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    textAlign:'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#FD5A7E',
    letterSpacing: 0.3,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  calendarContainer: {
    marginVertical: 8,
  },
  month: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
    letterSpacing: 0.5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    padding: 12,
    borderRadius: 50,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    fontWeight: '500',
  },
  cycleValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  cycleUnit: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  nextPeriod: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dropContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 2,
  },
  graphLine: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  phaseAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  phaseDate: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  phaseDesc: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  trackingCard: {
    backgroundColor: '#FF4C7C',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF4C7C',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  trackingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bulbIcon: {
    width: 44,
    height: 44,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  trackingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});