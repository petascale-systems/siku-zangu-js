import React, { useState, useCallback, useMemo } from 'react';
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
import { NavbarCard } from '@siku-zangu/expo';
import { useArticlesPage } from '@siku-zangu/react-native';
import { Article } from '@siku-zangu/core';
import { useLocalSearchParams, useRouter } from 'expo-router';
const ARTICLE_COVER_IMAGE_API_PATH = (articleId: string) => {
  const baseUrl = 'https://sikuzangu.org/';
  return `${baseUrl}/api/articles/${articleId}/cover-image`;
};
const translations = {
  en: {
    title: 'Insights and Tips',
    loadingArticles: 'Loading articles...',
    noArticles: 'No articles available yet',
    checkBackSoon: 'Check back soon for new content',
    readMore: 'Read More',
    by: 'By',
    page: 'Page',
    of: 'of',
    untitledArticle: 'Untitled Article',
    categories: {
      'body-education': 'Body Education',
      'birth-control': 'Birth Control',
      lifestyle: 'Lifestyle',
      nutrition: 'Nutrition',
      'mental-health': 'Mental Health',
      exercise: 'Exercise',
    },
  },
  sw: {
    title: 'Maarifa na Vidokezo',
    loadingArticles: 'Inapakia makala...',
    noArticles: 'Hakuna makala bado',
    checkBackSoon: 'Rudi tena hivi karibuni kwa maudhui mapya',
    readMore: 'Soma Zaidi',
    by: 'Na',
    page: 'Ukurasa',
    of: 'wa',
    untitledArticle: 'Makala Bila Kichwa',
    categories: {
      'body-education': 'Elimu ya Mwili',
      'birth-control': 'Uzazi wa Mpango',
      lifestyle: 'Mtindo wa Maisha',
      nutrition: 'Lishe',
      'mental-health': 'Afya ya Akili',
      exercise: 'Mazoezi',
    },
  },
};


const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};
interface ArticleCoverImageProps {
  articleId?: string;
  hasCoverImage?: boolean;
  title?: string;
  style?: any;
}
const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({
                                                               articleId,
                                                               hasCoverImage,
                                                               title,
                                                               style,
                                                             }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const coverImageUrl = useMemo(() => {
    if (!articleId || !hasCoverImage) {
      return null;
    }
    const url = ARTICLE_COVER_IMAGE_API_PATH(articleId);
    return url;
  }, [articleId, hasCoverImage]);

  if (!coverImageUrl) {
    return null;
  }
  return (
      <View style={style}>
        {loading && (
            <View style={[StyleSheet.absoluteFill, styles.imageLoading]}>
              <ActivityIndicator size="small" color="#FF4C7C" />
            </View>
        )}

        <Image
            source={{ uri: coverImageUrl }}
            style={[style, loading && { opacity: 0 }]}
            resizeMode="cover"
            onLoadStart={() => {
              setLoading(true);
              setError(false);
            }}
            onLoad={() => {
              setLoading(false);
            }}
            onError={(e) => {
              setError(true);
              setLoading(false);
            }}
            accessibilityLabel={`${title} cover image`}
        />

        {error && (
            <View style={[style, styles.imageError]}>
              <Ionicons name="image-outline" size={32} color="#999" />
              <Text style={styles.imageErrorText}>Image unavailable</Text>
            </View>
        )}
      </View>
  );
};

export default function InsightsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const language = (params.lang as 'en' | 'sw') ?? 'en';
  const userId = params.userId as string;

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { articlesPage, isFetchingArticlesPage } = useArticlesPage({
    page,
    size: pageSize,
    status: 'published',
    language,
  });

  const t = translations[language];

  const handleBack = useCallback(() => router.back(), [router]);
  const handleArticlePress = useCallback(
      (article: Article) => {
        router.push({
          pathname: 'tabs/ArticleDetailScreen',
          params: { articleId: article.article_id, lang: language, userId },
        });
      },
      [router, language, userId]
  );
  const renderArticleCard = useCallback(
      (article: Article, index: number) => {
        const isPink = index % 3 === 1;
        const contentPreview = article.kv?.content
            ? stripHtml(article.kv.content).substring(0, 150) + '...'
            : '';
        return (
            <TouchableOpacity
                key={article.article_id}
                style={[styles.card, isPink && styles.pinkCard]}
                onPress={() => handleArticlePress(article)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${t.readMore}: ${
                    article.kv?.title || t.untitledArticle
                }`}
            >
              <ArticleCoverImage
                  articleId={article.article_id}
                  hasCoverImage={article.kv?.has_cover_image}
                  title={article.kv?.title}
                  style={styles.coverImage}
              />
              <Text style={[styles.title, isPink && { color: '#fff' }]}>
                {article.kv?.title || t.untitledArticle}
              </Text>
              {contentPreview && (
                  <Text
                      style={[
                        styles.description,
                        isPink && { color: '#fff', opacity: 0.9 },
                      ]}
                      numberOfLines={3}
                  >
                    {contentPreview}
                  </Text>
              )}
              {article.kv?.author && (
                  <Text
                      style={[styles.author, isPink && { color: '#fff', opacity: 0.8 }]}
                  >
                    {t.by} {article.kv.author}
                  </Text>
              )}
              <View style={[styles.button, isPink && styles.whiteButton]}>
                <Text style={[styles.buttonText, isPink && { color: '#FF4C7C' }]}>
                  {t.readMore}
                </Text>
                <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={isPink ? '#FF4C7C' : '#fff'}
                />
              </View>
            </TouchableOpacity>
        );
      },
      [handleArticlePress]
  );
  const articles = useMemo(
      () => articlesPage?.items || [],
      [articlesPage?.items]
  );
  const totalPages = useMemo(
      () => articlesPage?.totalPages || 1,
      [articlesPage?.totalPages]
  );
  const handlePreviousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);
  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);
  return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <View style={{ width: 32 }} />
        </View>
        {isFetchingArticlesPage && page === 1 ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#FF4C7C" />
              <Text style={styles.loadingText}>{t.loadingArticles}</Text>
            </View>
        ) : articles.length === 0 ? (
            <View style={styles.centerContent}>
              <Ionicons name="document-text-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>{t.noArticles}</Text>
              <Text style={styles.emptySubtext}>{t.checkBackSoon}</Text>
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
                        style={[
                          styles.pageButton,
                          page === 1 && styles.pageButtonDisabled,
                        ]}
                        onPress={handlePreviousPage}
                        disabled={page === 1 || isFetchingArticlesPage}
                        accessibilityRole="button"
                        accessibilityLabel={`${t.page} ${page - 1}`}
                        accessibilityState={{ disabled: page === 1 }}
                    >
                      <Ionicons
                          name="chevron-back"
                          size={20}
                          color={page === 1 ? '#CCC' : '#FF4C7C'}
                      />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                      {t.page} {page} {t.of} {totalPages}
                    </Text>
                    <TouchableOpacity
                        style={[
                          styles.pageButton,
                          page === totalPages && styles.pageButtonDisabled,
                        ]}
                        onPress={handleNextPage}
                        disabled={page === totalPages || isFetchingArticlesPage}
                        accessibilityRole="button"
                        accessibilityLabel={`${t.page} ${page + 1}`}
                        accessibilityState={{ disabled: page === totalPages }}
                    >
                      <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={page === totalPages ? '#CCC' : '#FF4C7C'}
                      />
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
        <NavbarCard language={language} userId={userId} />
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
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
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
    backgroundColor: '#f0f0f0',
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  imageError: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  imageErrorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
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