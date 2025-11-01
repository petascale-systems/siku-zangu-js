import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NavbarCard } from '../components/App-nav-component';
import { useArticlesPage } from '@siku-zangu/react';
import { Article } from '@siku-zangu/core';
import { ARTICLE_COVER_IMAGE_API_PATH } from '@siku-zangu/react';

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;
const categoryIcons: Record<string, { icon: string; library: 'Ionicons' | 'MaterialCommunityIcons'; color: string }> = {
  'body-education': { icon: 'brain', library: 'MaterialCommunityIcons', color: '#FF4C7C' },
  'birth-control': { icon: 'male-female-outline', library: 'Ionicons', color: '#9C27B0' },
  'lifestyle': { icon: 'flower-outline', library: 'Ionicons', color: '#FF6B9D' },
  'nutrition': { icon: 'nutrition-outline', library: 'Ionicons', color: '#4CAF50' },
  'mental-health': { icon: 'happy-outline', library: 'Ionicons', color: '#2196F3' },
  'exercise': { icon: 'fitness-outline', library: 'Ionicons', color: '#FF9800' },
  'default': { icon: 'document-text-outline', library: 'Ionicons', color: '#FF4C7C' },
};

export const InsightsScreen = ({ navigation, route }: Props) => {
  const language = route.params?.lang ?? 'en';
  const userId = route.params?.userId;
  const insets = useSafeAreaInsets();

  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Use the existing hook
  const { articlesPage, isFetchingArticlesPage } = useArticlesPage({
    page,
    size: pageSize,
    status: 'published',
  });

  const handleBack = () => navigation.goBack();

  const handleArticlePress = (article: Article) => {
    // Navigate to article detail screen
    navigation.navigate('ArticleDetail', {
      articleId: article.article_id,
      lang: language,
      userId
    });
  };

  const getIconForCategory = (category?: string) => {
    const iconData = categoryIcons[category || 'default'] || categoryIcons['default'];
    const IconComponent = iconData.library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    return <IconComponent name={iconData.icon as any} size={26} color={iconData.color} />;
  };

  const getCoverImageUrl = (articleId?: string, hasCoverImage?: boolean) => {
    if (!articleId || !hasCoverImage) return null;
    return ARTICLE_COVER_IMAGE_API_PATH(articleId);
  };

  const renderArticleCard = (article: Article, index: number) => {
    const isPink = index % 3 === 1; // Make every 3rd card pink (0-indexed, so 1, 4, 7...)
    const coverImageUrl = getCoverImageUrl(article.article_id, article.kv?.has_cover_image);

    return (
      <TouchableOpacity
        key={article.article_id}
        style={[styles.card, isPink && styles.pinkCard]}
        onPress={() => handleArticlePress(article)}
        activeOpacity={0.7}
      >
        {coverImageUrl && (
          <Image
            source={{ uri: coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        <View style={[styles.iconCircle, isPink && { backgroundColor: '#fff' }]}>
          {getIconForCategory(article.kv?.category)}
        </View>

        <Text style={[styles.title, isPink && { color: '#fff' }]}>
          {article.kv?.title || 'Untitled Article'}
        </Text>

        {article.kv?.content && (
          <Text
            style={[styles.description, isPink && { color: '#fff', opacity: 0.9 }]}
            numberOfLines={3}
          >
            {article.kv.content.substring(0, 150)}...
          </Text>
        )}

        {article.kv?.author && (
          <Text style={[styles.author, isPink && { color: '#fff', opacity: 0.8 }]}>
            By {article.kv.author}
          </Text>
        )}

        <View style={[styles.button, isPink && styles.whiteButton]}>
          <Text style={[styles.buttonText, isPink && { color: '#FF4C7C' }]}>
            Read More
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={isPink ? '#FF4C7C' : '#fff'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const articles = articlesPage?.items || [];
  const totalPages = articlesPage?.totalPages || 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights and Tips</Text>
        <View style={{ width: 32 }} />
      </View>

      {isFetchingArticlesPage && page === 1 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF4C7C" />
          <Text style={styles.loadingText}>Loading articles...</Text>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="document-text-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No articles available yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for new content</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {articles.map((article, index) => renderArticleCard(article, index))}

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isFetchingArticlesPage}
              >
                <Ionicons name="chevron-back" size={20} color={page === 1 ? '#CCC' : '#FF4C7C'} />
              </TouchableOpacity>

              <Text style={styles.pageText}>
                Page {page} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetchingArticlesPage}
              >
                <Ionicons name="chevron-forward" size={20} color={page === totalPages ? '#CCC' : '#FF4C7C'} />
              </TouchableOpacity>
            </View>
          )}

          {isFetchingArticlesPage && page > 1 && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#FF4C7C" />
            </View>
          )}
        </ScrollView>
      )}

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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#BBB',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
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
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  author: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 16,
  },
  pageButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});