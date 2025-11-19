import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useArticle, ARTICLE_COVER_IMAGE_API_PATH } from '@siku-zangu/react';
import { useLocalSearchParams, useRouter } from 'expo-router';

const translations = {
  en: {
    loadingArticle: 'Loading article...',
    articleNotFound: 'Article not found',
    goBack: 'Go Back',
    saveArticle: 'Save Article',
    share: 'Share',
    relatedArticles: 'Related Articles',
    comingSoon: 'Coming soon...',
    lastUpdated: 'Last updated:',
    noContent: 'No content available.',
    categories: {
      'body-education': 'Body Education',
      'birth-control': 'Birth Control',
      'lifestyle': 'Lifestyle',
      'nutrition': 'Nutrition',
      'mental-health': 'Mental Health',
      'exercise': 'Exercise',
    },
  },
  sw: {
    loadingArticle: 'Inapakia makala...',
    articleNotFound: 'Makala haijapatikana',
    goBack: 'Rudi Nyuma',
    saveArticle: 'Hifadhi Makala',
    share: 'Shiriki',
    relatedArticles: 'Makala Zinazohusiana',
    comingSoon: 'Inakuja hivi karibuni...',
    lastUpdated: 'Imesasishwa mwisho:',
    noContent: 'Hakuna maudhui yanayopatikana.',
    categories: {
      'body-education': 'Elimu ya Mwili',
      'birth-control': 'Uzazi wa Mpango',
      'lifestyle': 'Mtindo wa Maisha',
      'nutrition': 'Lishe',
      'mental-health': 'Afya ya Akili',
      'exercise': 'Mazoezi',
    },
  },
};

const categoryIcons: Record<
  string,
  {
    icon: string;
    library: 'Ionicons' | 'MaterialCommunityIcons';
    color: string;
  }
> = {
  'body-education': {
    icon: 'brain',
    library: 'MaterialCommunityIcons',
    color: '#FF4C7C',
  },
  'birth-control': {
    icon: 'male-female-outline',
    library: 'Ionicons',
    color: '#9C27B0',
  },
  lifestyle: { icon: 'flower-outline', library: 'Ionicons', color: '#FF6B9D' },
  nutrition: {
    icon: 'nutrition-outline',
    library: 'Ionicons',
    color: '#4CAF50',
  },
  'mental-health': {
    icon: 'happy-outline',
    library: 'Ionicons',
    color: '#2196F3',
  },
  exercise: { icon: 'fitness-outline', library: 'Ionicons', color: '#FF9800' },
  default: {
    icon: 'document-text-outline',
    library: 'Ionicons',
    color: '#FF4C7C',
  },
};

export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;
  const articleId = params.articleId as string;

  const { article, isFetchingArticle } = useArticle(articleId);
  const t = translations[language];

  const handleBack = useCallback(() => router.back(), [router]);

  const getIconForCategory = useCallback((category?: string) => {
    const iconData =
      categoryIcons[category || 'default'] || categoryIcons['default'];
    const IconComponent =
      iconData.library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    return (
      <IconComponent
        name={iconData.icon as any}
        size={32}
        color={iconData.color}
      />
    );
  }, []);

  const getCoverImageUrl = useCallback(
    (articleId?: string, hasCoverImage?: boolean) => {
      if (!articleId || !hasCoverImage) return null;
      return ARTICLE_COVER_IMAGE_API_PATH(articleId);
    },
    []
  );

  const formatDate = useCallback(
    (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const locale = language === 'sw' ? 'sw-KE' : 'en-US';
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    [language]
  );

  const getCategoryName = useCallback(
    (category: string) => {
      return t.categories[category as keyof typeof t.categories] || category;
    },
    [t]
  );

  const coverImageUrl = useMemo(
    () => getCoverImageUrl(article?.article_id, article?.kv?.has_cover_image),
    [article, getCoverImageUrl]
  );
  if (isFetchingArticle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t.goBack}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF4C7C" />
          <Text style={styles.loadingText}>{t.loadingArticle}</Text>
        </View>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t.goBack}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4C7C" />
          <Text style={styles.errorText}>{t.articleNotFound}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t.goBack}
          >
            <Text style={styles.retryButtonText}>{t.goBack}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main Content
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t.goBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t.saveArticle}
          >
            <Ionicons name="bookmark-outline" size={22} color="#FF4C7C" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={t.share}
          >
            <Ionicons name="share-social-outline" size={22} color="#FF4C7C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {coverImageUrl && (
          <Image
            source={{ uri: coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
            accessibilityLabel={`${article.kv?.title} cover image`}
          />
        )}

        <View style={styles.articleHeader}>
          {article.kv?.category && (
            <View style={styles.categoryBadge}>
              <View style={styles.categoryIcon}>
                {getIconForCategory(article.kv.category)}
              </View>
              <Text style={styles.categoryText}>
                {getCategoryName(article.kv.category)}
              </Text>
            </View>
          )}

          <Text style={styles.articleTitle}>
            {article.kv?.title || 'Untitled Article'}
          </Text>

          <View style={styles.metaContainer}>
            {article.kv?.author && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{article.kv.author}</Text>
              </View>
            )}
            {article.created_at && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.metaText}>
                  {formatDate(article.created_at)}
                </Text>
              </View>
            )}
          </View>

          {article.kv?.status && article.kv.status !== 'published' && (
            <View
              style={[
                styles.statusBadge,
                article.kv.status === 'draft' && styles.draftBadge,
                article.kv.status === 'scheduled' && styles.scheduledBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {article.kv.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.contentContainer}>
          <Text style={styles.articleContent}>
            {article.kv?.content || t.noContent}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t.lastUpdated} {formatDate(article.updated_at || article.created_at)}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={t.saveArticle}
          >
            <Ionicons name="bookmark-outline" size={20} color="#FF4C7C" />
            <Text style={styles.actionButtonText}>{t.saveArticle}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            accessibilityRole="button"
            accessibilityLabel={t.share}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>
              {t.share}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>{t.relatedArticles}</Text>
          <Text style={styles.relatedSubtext}>{t.comingSoon}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
    paddingVertical: 12,
    backgroundColor: '#FFF5F2',
  },
  backButton: {
    padding: 6,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
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
  errorText: {
    marginTop: 24,
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF4C7C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  coverImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#f0f0f0',
  },
  articleHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  articleTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    lineHeight: 34,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  draftBadge: {
    backgroundColor: '#FFE0B2',
  },
  scheduledBadge: {
    backgroundColor: '#B3E5FC',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    textAlign: 'justify',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#FF4C7C',
  },
  shareButton: {
    backgroundColor: '#FF4C7C',
    borderColor: '#FF4C7C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4C7C',
  },
  relatedSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  relatedSubtext: {
    fontSize: 14,
    color: '#999',
  },
});