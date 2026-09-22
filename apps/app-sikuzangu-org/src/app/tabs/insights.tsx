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
import {Ionicons} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  controls,
  typography,
  useLanguage,
  useSession,
  useTabContentInset,
  PAGE_BOTTOM_PADDING
} from '@siku-zangu/expo';
import {useArticlesPage} from '@siku-zangu/react-native';
import {Article} from '@siku-zangu/core';
import {useRouter} from 'expo-router';
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
  const insets = useSafeAreaInsets();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  // From the session store, not the route params: the native tab navigator
  // switches tabs without params, so params.userId was undefined on every tab
  // except the one that was navigated to directly.
  const { userId } = useSession();
  const tabInset = useTabContentInset();

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { articlesPage, isFetchingArticlesPage } = useArticlesPage({
    page,
    size: pageSize,
    status: 'published',
    language,
  });

  const t = translations[language];

  const handleArticlePress = useCallback(
      (article: Article) => {
        router.push({
          pathname: '/article-detail',
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
              <Text
                  style={[styles.title, isPink && { color: colors.text.inverse }]}
                  numberOfLines={2}
              >
                {article.kv?.title || t.untitledArticle}
              </Text>
              {contentPreview && (
                  <Text
                      style={[
                        styles.description,
                        isPink && { color: colors.text.inverse, opacity: 0.9 },
                      ]}
                      numberOfLines={3}
                  >
                    {contentPreview}
                  </Text>
              )}
              {article.kv?.author && (
                  <Text
                      style={[styles.author, isPink && { color: colors.text.inverse, opacity: 0.8 }]}
                      numberOfLines={1}
                  >
                    {t.by} {article.kv.author}
                  </Text>
              )}
              <View style={[styles.button, isPink && styles.whiteButton]}>
                <Text style={[styles.buttonText, isPink && { color: colors.brand.text }]}>
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
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>{t.title}</Text>
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
                // UIKit already insets scroll content for the tab bar; this is the
                // cross-platform backstop so the last card clears it on Android too.
                contentInsetAdjustmentBehavior="automatic"
                    showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInset }]}
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
      </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // A tab root has no parent to go back to, so the back button that used to
    // sit here was always a no-op and has been removed; the title centres on
    // its own rather than being spread by space-between.
    justifyContent: 'center',
    paddingHorizontal: 16,
    // The title sits in a bar of its own, matching the platform header that
    // every pushed screen now uses. Without it the top of a tab root was bare
    // canvas, so moving from Profile into Change PIN flipped the top band from
    // grey to white. The safe-area inset is applied inline so the bar runs
    // behind the status bar rather than starting below it.
    backgroundColor: colors.surface.card,
    paddingBottom: 12,
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.heading,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: PAGE_BOTTOM_PADDING,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    ...typography.body,
    marginTop: 16,
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.body,
    marginTop: 16,
    color: colors.text.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.caption,
    marginTop: 8,
    color: colors.text.muted,
    textAlign: 'center',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
  },
  pinkCard: {
    backgroundColor: colors.surface.tint,
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.surface.muted,
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: 12,
  },
  imageError: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: 12,
  },
  imageErrorText: {
    ...typography.label,
    fontWeight: '400',
    marginTop: 8,
    color: colors.text.muted,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.app,
    marginBottom: 10,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  description: {
    ...typography.caption,
    color: colors.text.primary,
    marginBottom: 8,
  },
  author: {
    ...typography.label,
    fontWeight: '400',
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  button: {
    ...controls.primary,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 6,
  },
  buttonText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  whiteButton: {
    backgroundColor: colors.surface.card,
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
    backgroundColor: colors.surface.card,
    borderRadius: 20,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
});