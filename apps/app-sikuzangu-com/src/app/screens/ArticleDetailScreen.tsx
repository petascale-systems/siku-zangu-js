import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useArticle, ARTICLE_COVER_IMAGE_API_PATH } from '@siku-zangu/react';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleDetail'>;
const categoryIcons: Record<string, { icon: string; library: 'Ionicons' | 'MaterialCommunityIcons'; color: string }> = {
  'body-education': { icon: 'brain', library: 'MaterialCommunityIcons', color: '#FF4C7C' },
  'birth-control': { icon: 'male-female-outline', library: 'Ionicons', color: '#9C27B0' },
  'lifestyle': { icon: 'flower-outline', library: 'Ionicons', color: '#FF6B9D' },
  'nutrition': { icon: 'nutrition-outline', library: 'Ionicons', color: '#4CAF50' },
  'mental-health': { icon: 'happy-outline', library: 'Ionicons', color: '#2196F3' },
  'exercise': { icon: 'fitness-outline', library: 'Ionicons', color: '#FF9800' },
  'default': { icon: 'document-text-outline', library: 'Ionicons', color: '#FF4C7C' },
};

export const ArticleDetailScreen = ({ navigation, route }: Props) => {
  const { articleId, lang, userId } = route.params;
  const insets = useSafeAreaInsets();

  // Use the existing hook
  const { article, isFetchingArticle } = useArticle(articleId);

  const handleBack = () => navigation.goBack();

  const getIconForCategory = (category?: string) => {
    const iconData = categoryIcons[category || 'default'] || categoryIcons['default'];
    const IconComponent = iconData.library === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
    return <IconComponent name={iconData.icon as any} size={32} color={iconData.color} />;
  };

  const getCoverImageUrl = (articleId?: string, hasCoverImage?: boolean) => {
    if (!articleId || !hasCoverImage) return null;
    return ARTICLE_COVER_IMAGE_API_PATH(articleId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isFetchingArticle) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF4C7C" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4C7C" />
          <Text style={styles.errorText}>Article not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const coverImageUrl = getCoverImageUrl(article.article_id, article.kv?.has_cover_image);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={22} color="#FF4C7C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={22} color="#FF4C7C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Image */}
        {coverImageUrl && (
          <Image
            source={{ uri: coverImageUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        {/* Article Header */}
        <View style={styles.articleHeader}>
          {/* Category Badge */}
          {article.kv?.category && (
            <View style={styles.categoryBadge}>
              <View style={styles.categoryIcon}>
                {getIconForCategory(article.kv.category)}
              </View>
              <Text style={styles.categoryText}>
                {article.kv.category.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.articleTitle}>
            {article.kv?.title || 'Untitled Article'}
          </Text>

          {/* Meta Information */}
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
                <Text style={styles.metaText}>{formatDate(article.created_at)}</Text>
              </View>
            )}
          </View>

          {/* Status Badge (if draft or scheduled) */}
          {article.kv?.status && article.kv.status !== 'published' && (
            <View style={[
              styles.statusBadge,
              article.kv.status === 'draft' && styles.draftBadge,
              article.kv.status === 'scheduled' && styles.scheduledBadge,
            ]}>
              <Text style={styles.statusText}>
                {article.kv.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.articleContent}>
            {article.kv?.content || 'No content available.'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {formatDate(article.updated_at || article.created_at)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={20} color="#FF4C7C" />
            <Text style={styles.actionButtonText}>Save Article</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Related Articles Section */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Articles</Text>
          <Text style={styles.relatedSubtext}>Coming soon...</Text>
        </View>
      </ScrollView>
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