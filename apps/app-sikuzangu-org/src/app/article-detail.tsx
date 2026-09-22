import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  useWindowDimensions,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useArticle} from '@siku-zangu/react-native';
import {
  colors,
  controls,
  typography,
  useLanguage,
  PAGE_BOTTOM_PADDING,
  NUICard
} from '@siku-zangu/expo';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import RenderHTML from 'react-native-render-html';

const ARTICLE_COVER_IMAGE_API_PATH = (articleId: string) => {
  const baseUrl = 'https://sikuzangu.org/';
  return `${baseUrl}/api/articles/${articleId}/cover-image`;
};

const translations = {
  en: {
    loadingArticle: 'Loading article...',
    articleNotFound: 'Article not found',
    goBack: 'Go Back',
    lastUpdated: 'Last updated:',
    noContent: 'No content available.',
    references: 'References',
    medicalDisclaimer:
      'The information in this article is for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical concerns.',
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
    loadingArticle: 'Inapakia makala...',
    articleNotFound: 'Makala haijapatikana',
    goBack: 'Rudi Nyuma',
    lastUpdated: 'Imesasishwa mwisho:',
    noContent: 'Hakuna maudhui yanayopatikana.',
    references: 'Marejeleo',
    medicalDisclaimer:
      'Maudhui ya makala hii ni kwa madhumuni ya elimu pekee na siyo mbadala wa ushauri wa kitabibu. Tafadhali wasiliana na mtaalamu wa afya kwa masuala ya kiafya.',
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

const URL_REGEX = /(https?:\/\/[^\s)]+)/i;

interface ArticleCoverImageProps {
  coverImageUrl: string | null;
  title?: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({
                                                               coverImageUrl,
                                                               title,
                                                             }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!coverImageUrl) {
    return null;
  }

  return (
      <View style={styles.coverImageContainer}>
        {loading && (
            <View style={[StyleSheet.absoluteFill, styles.imageLoading]}>
              <ActivityIndicator size="large" color="#FF4C7C" />
            </View>
        )}

        <Image
            source={{ uri: coverImageUrl }}
            style={[styles.coverImage, loading && { opacity: 0 }]}
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
            <View style={styles.imageError}>
              <Ionicons name="image-outline" size={48} color="#999" />
              <Text style={styles.imageErrorText}>Cover image unavailable</Text>
            </View>
        )}
      </View>
  );
};

export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  // Language comes from the shared store, not the route param: a param is
  // frozen per screen, so switching language left every screen already on
  // the stack rendering the old one.
  const language = useLanguage();
  const articleId = params.articleId as string;

  const { article, isFetchingArticle } = useArticle(articleId);
  const t = translations[language];

  const handleBack = useCallback(() => router.back(), [router]);
  const getCoverImageUrl = useCallback(
      (articleId?: string, hasCoverImage?: boolean) => {
        if (!articleId || !hasCoverImage) return null;
        const url = ARTICLE_COVER_IMAGE_API_PATH(articleId);
        return url;
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



  const coverImageUrl = useMemo(
      () => getCoverImageUrl(article?.article_id, article?.kv?.has_cover_image),
      [article, getCoverImageUrl]
  );

  // Justified body copy, left-aligned headings. Android only honours
  // 'justify' from API 26; older devices fall back to left, which is fine.
  const tagsStyles = {
    body: {
      ...typography.body,
      color: colors.text.primary,
      textAlign: 'justify',
    },
    p: {
      ...typography.body,
      marginBottom: 16,
      color: colors.text.primary,
      textAlign: 'justify',
    },
    h1: {
      ...typography.displaySm,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: 24,
      marginBottom: 16,
    },
    h2: {
      ...typography.title,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: 20,
      marginBottom: 12,
    },
    h3: {
      ...typography.heading,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 16,
      marginBottom: 10,
    },
    h4: {
      ...typography.headingSm,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 14,
      marginBottom: 8,
    },
    h5: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 12,
      marginBottom: 8,
    },
    h6: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 12,
      marginBottom: 8,
    },
    ul: {
      marginBottom: 16,
      paddingLeft: 20,
    },
    ol: {
      marginBottom: 16,
      paddingLeft: 20,
    },
    li: {
      ...typography.body,
      marginBottom: 8,
      color: colors.text.primary,
      textAlign: 'justify',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.brand.base,
      paddingLeft: 16,
      marginLeft: 0,
      marginBottom: 16,
      fontStyle: 'italic',
      color: colors.text.secondary,
    },
    a: {
      color: colors.brand.text,
      textDecorationLine: 'underline',
    },
    strong: {
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    code: {
      ...typography.caption,
      backgroundColor: colors.surface.muted,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    pre: {
      backgroundColor: colors.surface.muted,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    img: {
      marginVertical: 16,
    },
  } as const;

  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true,
    },
  };

  if (isFetchingArticle) {
    return (
        // No `paddingTop: insets.top` and no hand-rolled back arrow: the route
        // declares a real header in `_layout.tsx`, which is present from the
        // first frame and already carries the status-bar and cutout inset.
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FF4C7C" />
            <Text style={styles.loadingText}>{t.loadingArticle}</Text>
          </View>
        </View>
    );
  }

  if (!article) {
    return (
        <View style={styles.container}>
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

  return (
      <View style={styles.container}>
        {/* Only the title depends on the article; everything else about this
            header is declared by the route in `_layout.tsx` so it exists
            before the article has loaded. The platform header truncates a long
            title with an ellipsis rather than wrapping it or pushing the back
            button off-screen. */}
        <Stack.Screen options={{ title: article.kv?.title || 'Untitled Article' }} />

        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          <ArticleCoverImage coverImageUrl={coverImageUrl} title={article.kv?.title} />

          <View style={styles.articleHeader}>


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
            {article.kv?.content ? (
                <RenderHTML
                    contentWidth={width - 40}
                    source={{ html: article.kv.content }}
                    tagsStyles={tagsStyles}
                    renderersProps={renderersProps}
                    defaultTextProps={{
                      selectable: true,
                    }}
                />
            ) : (
                <Text style={styles.noContentText}>{t.noContent}</Text>
            )}
          </View>

          {Array.isArray(article.kv?.references) && article.kv!.references!.length > 0 && (
              <NUICard variant="cardOutlined" style={styles.referencesContainer} padded={false}>
                <View style={styles.referencesHeader}>
                  <Ionicons name="document-text-outline" size={18} color="#FF4C7C" />
                  <Text style={styles.referencesTitle}>{t.references}</Text>
                </View>
                {article.kv!.references!.map((ref, idx) => {
                  const match = ref.match(URL_REGEX);
                  const url = match ? match[1] : null;
                  return (
                      <View key={idx} style={styles.referenceItem}>
                        <Text style={styles.referenceNumber}>{idx + 1}.</Text>
                        <Text style={styles.referenceText} selectable>
                          {url ? (
                              <>
                                <Text>{ref.replace(url, '')}</Text>
                                <Text
                                    style={styles.referenceLink}
                                    onPress={() => Linking.openURL(url).catch(() => undefined)}
                                >
                                  {url}
                                </Text>
                              </>
                          ) : (
                              ref
                          )}
                        </Text>
                      </View>
                  );
                })}
                <Text style={styles.medicalDisclaimer}>{t.medicalDisclaimer}</Text>
              </NUICard>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t.lastUpdated}{' '}
              {formatDate(article.updated_at || article.created_at)}
            </Text>
          </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.app,
  },
  scrollContent: {
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
  errorText: {
    ...typography.headingSm,
    marginTop: 24,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    ...controls.primary,
    marginTop: 20,
  },
  retryButtonText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  coverImageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: colors.surface.muted,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
  },
  imageError: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
  },
  imageErrorText: {
    ...typography.caption,
    marginTop: 12,
    color: colors.text.muted,
  },
  articleHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  articleTitle: {
    ...typography.title,
    fontWeight: '700',
    color: colors.text.primary,
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
    ...typography.caption,
    color: colors.text.secondary,
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
    ...typography.label,
    fontWeight: '700',
    color: colors.text.primary,
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
  noContentText: {
    ...typography.body,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    ...typography.label,
    fontWeight: '400',
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  referencesContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border.brand,
  },
  referencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  referencesTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  referenceItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingRight: 4,
  },
  referenceNumber: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    marginRight: 6,
    minWidth: 20,
  },
  referenceText: {
    ...typography.caption,
    flex: 1,
    color: colors.text.secondary,
  },
  referenceLink: {
    color: colors.brand.text,
    textDecorationLine: 'underline',
  },
  medicalDisclaimer: {
    ...typography.label,
    fontWeight: '400',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.brand,
    fontStyle: 'italic',
    color: colors.text.muted,
  },
});