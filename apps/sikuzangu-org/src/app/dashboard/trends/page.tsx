'use client';

import { useEffect, useState } from 'react';
import { Card, Spinner, Badge, Button } from 'flowbite-react';
import {
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {useUsersPage} from '@siku-zangu/react';

const calculateAge = (dateOfBirth: string): number => {
  try {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    return 0;
  }
};

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

interface FilterOptions {
  timeRange: string;
  trackingDuration: string;
  symptomType: string;
  ageGroup: string;
  activityLevel: string;
  periodRegularity: string;
}

interface PeriodTrackingTrend {
  month: string;
  usersTracking: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  consistency: number;
}

interface SymptomTrend {
  date: string;
  [key: string]: string | number;
}

interface UserEngagementTrend {
  week: string;
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
}

interface CycleRegularityData {
  category: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

interface AgeDistribution {
  ageGroup: string;
  count: number;
  avgCycleLength: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: 'Last 7 Days', value: '7days', days: 7 },
  { label: 'Last 30 Days', value: '30days', days: 30 },
  { label: 'Last 3 Months', value: '3months', days: 90 },
  { label: 'Last 6 Months', value: '6months', days: 180 },
  { label: 'Last Year', value: '1year', days: 365 },
  { label: 'All Time', value: 'all', days: 10000 },
];

const TRACKING_DURATION_OPTIONS = [
  { label: 'All Users', value: 'all' },
  { label: '1+ Month', value: '1month' },
  { label: '3+ Months', value: '3months' },
  { label: '6+ Months', value: '6months' },
  { label: '1+ Year', value: '1year' },
];

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const DASHBOARD_COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  tertiary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export default function TrendsPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: '3months',
    trackingDuration: 'all',
    symptomType: 'all',
    ageGroup: 'all',
    activityLevel: 'all',
    periodRegularity: 'all',
  });

  const [userFetchParams] = useState({ page: 1, size: 1000 });
  const { usersPage, isFetchingUsersPage } = useUsersPage(userFetchParams);

  const [periodTrackingTrends, setPeriodTrackingTrends] = useState<PeriodTrackingTrend[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [engagementTrends, setEngagementTrends] = useState<UserEngagementTrend[]>([]);
  const [cycleRegularity, setCycleRegularity] = useState<CycleRegularityData[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<AgeDistribution[]>([]);
  const [topSymptomsByPeriod, setTopSymptomsByPeriod] = useState<any[]>([]);
  const [consistencyScore, setConsistencyScore] = useState<number>(0);
  const [growthRate, setGrowthRate] = useState<number>(0);

  const getFilteredUsers = () => {
    if (!usersPage?.items) return [];
    let filtered = [...usersPage.items];
    const now = new Date();
    const timeRangeConfig = TIME_RANGES.find((tr) => tr.value === filters.timeRange);
    const daysBack = timeRangeConfig?.days || 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    if (filters.trackingDuration !== 'all') {
      filtered = filtered.filter((user) => {
        if (!user.created_at) return false;
        const userCreated = new Date(user.created_at);
        const monthsTracking = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24 * 30);

        switch (filters.trackingDuration) {
          case '1month':
            return monthsTracking >= 1;
          case '3months':
            return monthsTracking >= 3;
          case '6months':
            return monthsTracking >= 6;
          case '1year':
            return monthsTracking >= 12;
          default:
            return true;
        }
      });
    }

    filtered = filtered.filter((user) => {
      if (!user.created_at) return false;
      return new Date(user.created_at) >= cutoffDate;
    });

    if (filters.ageGroup !== 'all') {
      filtered = filtered.filter((user) => {
        const dateOfBirth = user.kv?.date_of_birth;
        if (!dateOfBirth) return false;

        const age = calculateAge(dateOfBirth);
        if (age === 0) return false;

        switch (filters.ageGroup) {
          case '13-17':
            return age >= 13 && age <= 17;
          case '18-24':
            return age >= 18 && age <= 24;
          case '25-34':
            return age >= 25 && age <= 34;
          case '35-44':
            return age >= 35 && age <= 44;
          case '45+':
            return age >= 45;
          default:
            return true;
        }
      });
    }

    if (filters.periodRegularity !== 'all') {
      filtered = filtered.filter((user) => {
        const cycleLength = user.kv?.avg_cycle_length_days;
        if (!cycleLength) return false;

        switch (filters.periodRegularity) {
          case 'regular':
            return cycleLength >= 24 && cycleLength <= 32;
          case 'irregular':
            return cycleLength < 24 || cycleLength > 32;
          default:
            return true;
        }
      });
    }
    return filtered;
  };

  useEffect(() => {
    if (!usersPage?.items) return;
    const filteredUsers = getFilteredUsers();
    const now = new Date();
    const timeRangeConfig = TIME_RANGES.find((tr) => tr.value === filters.timeRange);
    const daysBack = timeRangeConfig?.days || 90;

    // Calculate Period Tracking Trends
    const monthlyData: { [key: string]: { users: Set<string>; cycles: number[]; periods: number[] } } = {};

    for (let i = 0; i < Math.min(12, Math.ceil(daysBack / 30)); i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = { users: new Set(), cycles: [], periods: [] };
    }

    filteredUsers.forEach((user) => {
      if (!user.created_at) return;
      const createdDate = new Date(user.created_at);
      const monthKey = createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (monthlyData[monthKey]) {
        if (user.user_id != null) {
          monthlyData[monthKey].users.add(user.user_id);
        }

        if (user.kv?.avg_cycle_length_days) {
          monthlyData[monthKey].cycles.push(user.kv.avg_cycle_length_days);
        }
        if (user.kv?.avg_period_length_days) {
          monthlyData[monthKey].periods.push(user.kv.avg_period_length_days);
        }
      }
    });

    const periodTrends = Object.entries(monthlyData)
        .map(([month, data]) => {
          const avgCycle = data.cycles.length > 0
              ? data.cycles.reduce((a, b) => a + b, 0) / data.cycles.length
              : 0;
          const avgPeriod = data.periods.length > 0
              ? data.periods.reduce((a, b) => a + b, 0) / data.periods.length
              : 0;
          const variance = data.cycles.length > 1
              ? data.cycles.reduce((sum, val) => sum + Math.pow(val - avgCycle, 2), 0) / data.cycles.length
              : 0;
          const consistency = variance > 0 ? 100 - Math.min(variance * 2, 100) : 100;

          return {
            month,
            usersTracking: data.users.size,
            avgCycleLength: Math.round(avgCycle * 10) / 10,
            avgPeriodLength: Math.round(avgPeriod * 10) / 10,
            consistency: Math.round(consistency),
          };
        })
        .reverse();

    setPeriodTrackingTrends(periodTrends);
    const allConsistency = periodTrends.map((p) => p.consistency).filter((c) => c > 0);
    const avgConsistency = allConsistency.length > 0
        ? allConsistency.reduce((a, b) => a + b, 0) / allConsistency.length
        : 0;
    setConsistencyScore(Math.round(avgConsistency));
    const symptomsByDate: { [key: string]: { [symptom: string]: number } } = {};

    filteredUsers.forEach((user) => {
      if (user.kv?.symptom_logs) {
        try {
          let logs = user.kv.symptom_logs;
          if (typeof logs === 'string') logs = JSON.parse(logs);

          if (Array.isArray(logs)) {
            logs.forEach((log: any) => {
              if (log.date && log.symptom) {
                const dateKey = new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!symptomsByDate[dateKey]) symptomsByDate[dateKey] = {};
                symptomsByDate[dateKey][log.symptom] = (symptomsByDate[dateKey][log.symptom] || 0) + 1;
              }
            });
          }
        } catch (e) {
          console.error('Error parsing symptom logs:', e);
        }
      }
    });

    const symptomTrendData = Object.entries(symptomsByDate)
        .map(([date, symptoms]) => ({ date, ...symptoms }))
        .slice(0, 30)
        .reverse();

    setSymptomTrends(symptomTrendData);
    const weeklyEngagement: { [key: string]: { new: Set<string>; active: Set<string> } } = {};

    for (let i = 0; i < Math.min(12, Math.ceil(daysBack / 7)); i++) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekKey = `Week ${i + 1}`;
      weeklyEngagement[weekKey] = { new: new Set(), active: new Set() };
    }

    filteredUsers.forEach((user) => {
      const created = new Date(user.created_at || now);
      const weeksAgo = Math.floor((now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekKey = `Week ${weeksAgo + 1}`;

      if (weeklyEngagement[weekKey]) {
        if (user.user_id != null) {
          weeklyEngagement[weekKey].new.add(user.user_id);
        }
        if (user.kv?.status === 'active') {
          if (user.user_id != null) {
            weeklyEngagement[weekKey].active.add(user.user_id);
          }
        }
      }
    });

    const engagementData = Object.entries(weeklyEngagement)
        .map(([week, data]) => ({
          week,
          newUsers: data.new.size,
          activeUsers: data.active.size,
          retentionRate: data.new.size > 0 ? Math.round((data.active.size / data.new.size) * 100) : 0,
        }))
        .reverse();

    setEngagementTrends(engagementData);
    if (engagementData.length >= 2) {
      const recent = engagementData[engagementData.length - 1].newUsers;
      const previous = engagementData[engagementData.length - 2].newUsers;
      const growth = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
      setGrowthRate(Math.round(growth * 10) / 10);
    }

    const regularity = {
      regular: 0,
      slightlyIrregular: 0,
      irregular: 0,
      veryIrregular: 0,
    };

    filteredUsers.forEach((user) => {
      const cycleLength = user.kv?.avg_cycle_length_days;
      if (cycleLength) {
        if (cycleLength >= 26 && cycleLength <= 30) regularity.regular++;
        else if (cycleLength >= 24 && cycleLength <= 32) regularity.slightlyIrregular++;
        else if (cycleLength >= 21 && cycleLength <= 35) regularity.irregular++;
        else regularity.veryIrregular++;
      }
    });

    const total = Object.values(regularity).reduce((a, b) => a + b, 0);
    const regularityData: CycleRegularityData[] = [
      { category: 'Regular (26-30 days)', count: regularity.regular, percentage: (regularity.regular / total) * 100 },
      { category: 'Slightly Irregular (24-32 days)', count: regularity.slightlyIrregular, percentage: (regularity.slightlyIrregular / total) * 100 },
      { category: 'Irregular (21-35 days)', count: regularity.irregular, percentage: (regularity.irregular / total) * 100 },
      { category: 'Very Irregular (<21 or >35 days)', count: regularity.veryIrregular, percentage: (regularity.veryIrregular / total) * 100 },
    ];

    setCycleRegularity(regularityData);
    const ageGroups: { [key: string]: { count: number; cycleLengths: number[] } } = {
      '13-17': { count: 0, cycleLengths: [] },
      '18-24': { count: 0, cycleLengths: [] },
      '25-34': { count: 0, cycleLengths: [] },
      '35-44': { count: 0, cycleLengths: [] },
      '45+': { count: 0, cycleLengths: [] },
    };

    filteredUsers.forEach((user) => {
      const dateOfBirth = user.kv?.date_of_birth;
      const cycleLength = user.kv?.avg_cycle_length_days;

      if (dateOfBirth) {
        const age = calculateAge(dateOfBirth);

        if (age > 0) {
          let group = '';
          if (age >= 13 && age <= 17) group = '13-17';
          else if (age >= 18 && age <= 24) group = '18-24';
          else if (age >= 25 && age <= 34) group = '25-34';
          else if (age >= 35 && age <= 44) group = '35-44';
          else if (age >= 45) group = '45+';

          if (group && ageGroups[group]) {
            ageGroups[group].count++;
            if (cycleLength) ageGroups[group].cycleLengths.push(cycleLength);
          }
        }
      }
    });

    const ageDistData = Object.entries(ageGroups).map(([ageGroup, data]) => ({
      ageGroup,
      count: data.count,
      avgCycleLength: data.cycleLengths.length > 0
          ? Math.round((data.cycleLengths.reduce((a, b) => a + b, 0) / data.cycleLengths.length) * 10) / 10
          : 0,
    }));

    setAgeDistribution(ageDistData);
    const symptomsByPhase: { [phase: string]: { [symptom: string]: number } } = {
      menstrual: {},
      follicular: {},
      ovulation: {},
      luteal: {},
    };

    filteredUsers.forEach((user) => {
      if (user.kv?.symptom_logs) {
        try {
          let logs = user.kv.symptom_logs;
          if (typeof logs === 'string') logs = JSON.parse(logs);

          if (Array.isArray(logs)) {
            logs.forEach((log: any) => {
              const phase = log.phase || 'menstrual';
              const symptom = log.symptom;
              if (symptom && symptomsByPhase[phase]) {
                symptomsByPhase[phase][symptom] = (symptomsByPhase[phase][symptom] || 0) + 1;
              }
            });
          }
        } catch (e) {
          console.error('Error parsing symptoms by phase:', e);
        }
      }
    });

    const topSymptoms = Object.entries(symptomsByPhase).map(([phase, symptoms]) => {
      const sorted = Object.entries(symptoms)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([symptom, count]) => ({
            symptom: symptom.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            count,
          }));
      return { phase, symptoms: sorted };
    });

    setTopSymptomsByPeriod(topSymptoms);
  }, [usersPage, filters]);

  const handleFilterChange = (filterName: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const StatCard = ({
                      title,
                      value,
                      change,
                      icon: Icon,
                      color,
                      trend,
                    }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
      <Card className="shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold mb-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {change !== undefined && (
                <div className="flex items-center gap-1">
                  {trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />}
                  {trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {change >= 0 ? '+' : ''}
                    {change}%
              </span>
                </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
  );

  if (isFetchingUsersPage && !usersPage) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Spinner size="xl" color="gray" />
        </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
      <div className="px-5 pb-5">
        <div className="w-full space-y-6 bg-gray-50 py-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl  text-neutral-dark-text">Trends & Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">
                Comprehensive insights into user behavior and health tracking patterns
              </p>
            </div>
          </div>
          <Card className="shadow-sm">
            <h3 className="text-lg  mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-purple-600" />
              Filter Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                <select
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {TIME_RANGES.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Duration</label>
                <select
                    value={filters.trackingDuration}
                    onChange={(e) => handleFilterChange('trackingDuration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {TRACKING_DURATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                <select
                    value={filters.ageGroup}
                    onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Ages</option>
                  <option value="13-17">13-17 years</option>
                  <option value="18-24">18-24 years</option>
                  <option value="25-34">25-34 years</option>
                  <option value="35-44">35-44 years</option>
                  <option value="45+">45+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period Regularity</label>
                <select
                    value={filters.periodRegularity}
                    onChange={(e) => handleFilterChange('periodRegularity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All</option>
                  <option value="regular">Regular (24-32 days)</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                    value={filters.activityLevel}
                    onChange={(e) => handleFilterChange('activityLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                    color="gray"
                    onClick={() =>
                        setFilters({
                          timeRange: '3months',
                          trackingDuration: 'all',
                          symptomType: 'all',
                          ageGroup: 'all',
                          activityLevel: 'all',
                          periodRegularity: 'all',
                        })
                    }
                    className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge color="purple">{filteredUsers.length} users match filters</Badge>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total Users Tracked"
                value={filteredUsers.length}
                change={growthRate}
                icon={UserGroupIcon}
                color="bg-blue-500"
                trend={growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral'}
            />
            <StatCard
                title="Avg Cycle Consistency"
                value={`${consistencyScore}%`}
                change={5}
                icon={HeartIcon}
                color="bg-purple-500"
                trend="up"
            />
            <StatCard
                title="Active Trackers"
                value={filteredUsers.filter((u) => u.kv?.prev_cycle_start_date).length}
                change={8}
                icon={CalendarIcon}
                color="bg-pink-500"
                trend="up"
            />
            <StatCard
                title="User Growth Rate"
                value={`${growthRate}%`}
                icon={ArrowTrendingUpIcon}
                color="bg-cyan-500"
                trend={growthRate > 0 ? 'up' : 'down'}
            />
          </div>

          {/* Period Tracking Trends */}
          <Card className="shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              Period Tracking Trends Over Time
            </h3>
            {isFetchingUsersPage ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Spinner size="lg" color="gray" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={periodTrackingTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="usersTracking"
                        name="Users Tracking"
                        fill="#8b5cf6"
                        stroke="#8b5cf6"
                        fillOpacity={0.6}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgCycleLength"
                        name="Avg Cycle Length (days)"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={{ fill: '#ec4899', r: 4 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="consistency"
                        name="Consistency Score (%)"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e', r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
            )}
          </Card>

          {/* Symptom Trends and Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Engagement Trends */}
            <Card className="shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-600" />
                User Engagement & Retention
              </h3>
              {isFetchingUsersPage ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Spinner size="lg" color="gray" />
                  </div>
              ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="week" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="newUsers" name="New Users" fill="#8b5cf6" />
                      <Bar dataKey="activeUsers" name="Active Users" fill="#22c55e" />
                      <Bar dataKey="retentionRate" name="Retention Rate (%)" fill="#eab308" />
                    </BarChart>
                  </ResponsiveContainer>
              )}
            </Card>
            <Card className="shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                Cycle Regularity Distribution
              </h3>
              {isFetchingUsersPage ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Spinner size="lg" color="gray" />
                  </div>
              ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                          data={cycleRegularity as any}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => {
                            // Type-safe label function - entry contains the data object
                            const category = entry.category || entry.name;
                            const percent = entry.percent;

                            if (typeof category === 'string' && typeof percent === 'number') {
                              const categoryName = category.split('(')[0].trim();
                              return `${categoryName}: ${(percent * 100).toFixed(1)}%`;
                            }
                            return '';
                          }}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                      >
                        {cycleRegularity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
              )}
            </Card>
          </div>
          <Card className="shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-purple-600" />
              Age Distribution & Average Cycle Lengths
            </h3>
            {isFetchingUsersPage ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Spinner size="lg" color="gray" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="ageGroup" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="User Count" fill="#8b5cf6" />
                    <Bar yAxisId="right" dataKey="avgCycleLength" name="Avg Cycle Length (days)" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
            )}
          </Card>
          <Card className="shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-purple-600" />
              Top Symptoms by Menstrual Cycle Phase
            </h3>
            {isFetchingUsersPage ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" color="gray" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topSymptomsByPeriod.map((phaseData, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                          {phaseData.phase} Phase
                        </h4>
                        <div className="space-y-2">
                          {phaseData.symptoms.length > 0 ? (
                              phaseData.symptoms.map((symptom: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">{symptom.symptom}</span>
                                    <Badge color="purple">{symptom.count}</Badge>
                                  </div>
                              ))
                          ) : (
                              <p className="text-sm text-gray-500">No data available</p>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </Card>
        </div>
      </div>
  );
}