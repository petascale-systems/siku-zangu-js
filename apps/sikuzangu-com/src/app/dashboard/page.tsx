'use client'

import { useEffect, useState } from 'react';
import { Card, Spinner } from 'flowbite-react';
import {
  UsersIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUsersPage } from '@siku-zangu/react';
import { useArticlesPage } from '@siku-zangu/react';

interface DashboardStats {
  totalUsers: number;
  totalUsersChange: number;
  activeUsers: number;
  activeUsersChange: number;
  articles: number;
  articlesChange: number;
  symptomReports: number;
  symptomReportsChange: number;
}

interface ActivityData {
  day: string;
  value: number;
}

interface SymptomData {
  month: string;
  periodAlerts: number;
  fertileAlerts: number;
  medicationTips: number;
}

interface RecentActivity {
  activity: string;
  user: string;
  date: string;
}

interface SymptomStat {
  symptom: string;
  count: number;
  percentage: number;
}

export default function DashboardPage() {
  const [userFetchParams] = useState({ page: 1, size: 500 });
  const [articleFetchParams] = useState({ page: 1, size: 100 });

  const { usersPage, isFetchingUsersPage } = useUsersPage(userFetchParams);
  const { articlesPage, isFetchingArticlesPage } = useArticlesPage(articleFetchParams);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userActivity, setUserActivity] = useState<ActivityData[]>([]);
  const [symptomData, setSymptomData] = useState<SymptomData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topSymptoms, setTopSymptoms] = useState<SymptomStat[]>([]);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    // Calculate stats from users and articles data
    if (usersPage?.items) {
      const totalUsers = usersPage.totalItems || usersPage.items.length;

      // Calculate active users (users with active status)
      const activeUsers = usersPage.items.filter(user =>
        user.kv?.status === 'active'
      ).length;

      // Count users who have tracking data as symptom reports
      const symptomReports = usersPage.items.filter(user =>
        user.kv?.prev_cycle_start_date ||
        user.kv?.avg_cycle_length_days ||
        user.kv?.avg_period_length_days
      ).length;

      const totalArticles = articlesPage?.totalItems || articlesPage?.items?.length || 0;

      setStats({
        totalUsers: totalUsers,
        totalUsersChange: 8,
        activeUsers: activeUsers,
        activeUsersChange: 5,
        articles: totalArticles,
        articlesChange: 12,
        symptomReports: symptomReports,
        symptomReportsChange: 3
      });

      // Generate user activity data from actual user registration dates
      const activityByDay: { [key: string]: number } = {
        'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
      };

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      usersPage.items.forEach(user => {
        if (user.created_at) {
          const createdDate = new Date(user.created_at);
          if (createdDate >= sevenDaysAgo) {
            const dayName = createdDate.toLocaleDateString('en-US', { weekday: 'short' });
            if (activityByDay[dayName] !== undefined) {
              activityByDay[dayName]++;
            }
          }
        }
      });

      // Scale values for better visualization
      const maxValue = Math.max(...Object.values(activityByDay));
      const scaleFactor = maxValue > 0 ? 1000 / maxValue : 1;

      setUserActivity([
        { day: 'Mon', value: Math.round(activityByDay['Mon'] * scaleFactor) },
        { day: 'Tue', value: Math.round(activityByDay['Tue'] * scaleFactor) },
        { day: 'Wed', value: Math.round(activityByDay['Wed'] * scaleFactor) },
        { day: 'Thu', value: Math.round(activityByDay['Thu'] * scaleFactor) },
        { day: 'Fri', value: Math.round(activityByDay['Fri'] * scaleFactor) },
        { day: 'Sat', value: Math.round(activityByDay['Sat'] * scaleFactor) },
        { day: 'Sun', value: Math.round(activityByDay['Sun'] * scaleFactor) }
      ]);

      // Process symptom/alert preferences from all users by month
      const symptomsByMonth: { [key: string]: { period: number; fertile: number; medication: number } } = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Initialize last 6 months
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = monthNames[date.getMonth()];
        symptomsByMonth[monthKey] = { period: 0, fertile: 0, medication: 0 };
      }

      // Count alert preferences by user creation month
      usersPage.items.forEach(user => {
        if (user.created_at) {
          const createdDate = new Date(user.created_at);
          const monthKey = monthNames[createdDate.getMonth()];

          if (symptomsByMonth[monthKey]) {
            if (user.kv?.receive_period_alerts) {
              symptomsByMonth[monthKey].period++;
            }
            if (user.kv?.receive_fertile_alerts) {
              symptomsByMonth[monthKey].fertile++;
            }
            if (user.kv?.receive_medication_tips) {
              symptomsByMonth[monthKey].medication++;
            }
          }
        }
      });

      // Convert to chart format
      const symptomChartData = Object.entries(symptomsByMonth).map(([month, data]) => ({
        month,
        periodAlerts: data.period,
        fertileAlerts: data.fertile,
        medicationTips: data.medication
      }));

      setSymptomData(symptomChartData);

      // Generate recent activity from users and articles
      const activities: RecentActivity[] = [];

      // Add recent user registrations
      const recentUsers = [...usersPage.items]
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 3);

      recentUsers.forEach(user => {
        const firstName = user.kv?.first_name || '';
        const lastName = user.kv?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const displayName = fullName || user.kv?.email || user.kv?.phone_number || 'Unknown User';

        activities.push({
          activity: 'New user registered',
          user: displayName,
          date: user.created_at ? new Date(user.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A'
        });
      });

      // Add recent articles if available
      if (articlesPage?.items) {
        const recentArticles = [...articlesPage.items]
          .filter(article => article.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 2);

        recentArticles.forEach(article => {
          activities.push({
            activity: 'Article published',
            user: 'Admin User',
            date: article.created_at ? new Date(article.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A'
          });
        });
      }

      // Sort all activities by date
      activities.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      setRecentActivity(activities.slice(0, 5));

      // Calculate top logged symptoms
      const symptomCounts: { [key: string]: number } = {};
      let totalSymptomInstances = 0;

      console.log('=== SYMPTOM ANALYSIS START ===');
      console.log('Total users to process:', usersPage.items.length);

      usersPage.items.forEach((user, userIndex) => {
        // Debug: Log first user's kv structure
        if (userIndex === 0) {
          console.log('Sample user kv structure:', user.kv);
          console.log('Sample selected_symptoms:', user.kv?.selected_symptoms);
          console.log('Sample symptom_logs:', user.kv?.symptom_logs);
        }

        // Count from selected_symptoms (user preferences)
        if (user.kv?.selected_symptoms) {
          try {
            let selectedSymptoms = user.kv.selected_symptoms;

            console.log(`User ${userIndex} selected_symptoms type:`, typeof selectedSymptoms);
            console.log(`User ${userIndex} selected_symptoms value:`, selectedSymptoms);

            // Handle if it's a string that needs parsing
            if (typeof selectedSymptoms === 'string') {
              selectedSymptoms = JSON.parse(selectedSymptoms);
            }

            console.log(`User ${userIndex} parsed selected_symptoms:`, selectedSymptoms);

            // Now process the array
            if (Array.isArray(selectedSymptoms) && selectedSymptoms.length > 0) {
              selectedSymptoms.forEach((symptom: string) => {
                if (symptom && typeof symptom === 'string') {
                  symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
                  totalSymptomInstances++;
                  console.log(`Added symptom: ${symptom}, new count: ${symptomCounts[symptom]}`);
                }
              });
            }
          } catch (e) {
            console.error('Error parsing selected_symptoms:', e, user.kv?.selected_symptoms);
          }
        }

        // Count from symptom_logs (actual logged symptoms)
        if (user.kv?.symptom_logs) {
          try {
            let symptomLogs = user.kv.symptom_logs;

            // Handle if it's a string that needs parsing
            if (typeof symptomLogs === 'string') {
              symptomLogs = JSON.parse(symptomLogs);
            }

            // Now process the array
            if (Array.isArray(symptomLogs) && symptomLogs.length > 0) {
              symptomLogs.forEach((log: any) => {
                if (log && log.symptom && typeof log.symptom === 'string') {
                  symptomCounts[log.symptom] = (symptomCounts[log.symptom] || 0) + 1;
                  totalSymptomInstances++;
                  console.log(`Added logged symptom: ${log.symptom}, new count: ${symptomCounts[log.symptom]}`);
                }
              });
            }
          } catch (e) {
            console.error('Error parsing symptom_logs:', e, user.kv?.symptom_logs);
          }
        }
      });

      console.log('=== SYMPTOM ANALYSIS COMPLETE ===');
      console.log('Total symptom instances found:', totalSymptomInstances);
      console.log('Symptom counts:', symptomCounts);

      // Convert to array and sort by count
      const sortedSymptoms = Object.entries(symptomCounts)
        .map(([symptom, count]) => ({
          symptom: symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
          percentage: totalSymptomInstances > 0 ? (count / totalSymptomInstances) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      console.log('Top 5 symptoms:', sortedSymptoms);

      setTopSymptoms(sortedSymptoms);
    }
  }, [usersPage, articlesPage]);

  const StatCard = ({
                      title,
                      value,
                      change,
                      icon: Icon,
                      color
                    }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    color: string;
  }) => (
    <Card className="shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold mb-2">{value.toLocaleString()}</p>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const isLoading = (isFetchingUsersPage && !usersPage) || (isFetchingArticlesPage && !articlesPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" color="gray" />
      </div>
    );
  }

  return (
    <div className="px-5 pb-5">
      <div className="w-full space-y-6 bg-gray-50 py-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-medium">Dashboard Overview</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              change={stats.totalUsersChange}
              icon={UsersIcon}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              change={stats.activeUsersChange}
              icon={UserGroupIcon}
              color="bg-purple-500"
            />
            <StatCard
              title="Articles"
              value={stats.articles}
              change={stats.articlesChange}
              icon={DocumentTextIcon}
              color="bg-pink-500"
            />
            <StatCard
              title="Health Tracking Users"
              value={stats.symptomReports}
              change={stats.symptomReportsChange}
              icon={ClipboardDocumentListIcon}
              color="bg-cyan-500"
            />
          </div>
        )}

        {/* Charts and Top Symptoms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* User Activity Chart */}
          <Card className="shadow-sm lg:col-span-2">
            <h3 className="text-lg font-medium mb-4">User Activity (Last 7 Days)</h3>
            {isFetchingUsersPage ? (
              <div className="flex items-center justify-center h-[300px]">
                <Spinner size="lg" color="gray" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Top Logged Symptoms */}
          <Card className="shadow-sm">
            <h3 className="text-lg font-medium mb-4">Top Logged Symptoms</h3>
            {isFetchingUsersPage ? (
              <div className="flex items-center justify-center h-[300px]">
                <Spinner size="lg" color="gray" />
              </div>
            ) : topSymptoms.length > 0 ? (
              <div className="space-y-4">
                {topSymptoms.map((symptom, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {symptom.symptom}
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {symptom.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${symptom.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {symptom.percentage.toFixed(1)}% of all logs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No symptom data available
              </div>
            )}
          </Card>
        </div>

        {/* Alert Preferences Chart */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-sm">
            <h3 className="text-lg font-medium mb-4">User Alert Preferences (Last 6 Months)</h3>
            {isFetchingUsersPage ? (
              <div className="flex items-center justify-center h-[300px]">
                <Spinner size="lg" color="gray" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptomData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="periodAlerts" name="Period Alerts" fill="#8b5cf6" />
                  <Bar dataKey="fertileAlerts" name="Fertile Alerts" fill="#eab308" />
                  <Bar dataKey="medicationTips" name="Medication Tips" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-sm">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          {isFetchingUsersPage || isFetchingArticlesPage ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" color="gray" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
                </thead>
                <tbody>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{activity.activity}</td>
                      <td className="px-6 py-4 font-medium">{activity.user}</td>
                      <td className="px-6 py-4 text-gray-500">{activity.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No recent activity found
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}