import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useArticle } from '@siku-zangu/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

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

  const tagsStyles = {
    body: {
      color: '#333',
      fontSize: 16,
      lineHeight: 26,
    },
    p: {
      marginBottom: 16,
      color: '#333',
      fontSize: 16,
      lineHeight: 26,
    },
    h1: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1a1a1a',
      marginTop: 24,
      marginBottom: 16,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1a1a1a',
      marginTop: 20,
      marginBottom: 12,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1a1a1a',
      marginTop: 16,
      marginBottom: 10,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginTop: 14,
      marginBottom: 8,
    },
    h5: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginTop: 12,
      marginBottom: 8,
    },
    h6: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
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
      marginBottom: 8,
      color: '#333',
      fontSize: 16,
      lineHeight: 26,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#FF4C7C',
      paddingLeft: 16,
      marginLeft: 0,
      marginBottom: 16,
      fontStyle: 'italic',
      color: '#666',
    },
    a: {
      color: '#FF4C7C',
      textDecorationLine: 'underline',
    },
    strong: {
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    code: {
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    pre: {
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    img: {
      marginVertical: 16,
    },
  };

  const renderersProps = {
    img: {
      enableExperimentalPercentWidth: true,
    },
  };

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
        </View>

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          <ArticleCoverImage coverImageUrl={coverImageUrl} title={article.kv?.title} />

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
  coverImageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#f0f0f0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  imageError: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageErrorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
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
  noContentText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#999',
    fontStyle: 'italic',
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
});