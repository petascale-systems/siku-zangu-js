'use client';

import {
  Button,
  Label,
  Radio,
  Select,
  Spinner,
  TextInput,
} from 'flowbite-react';
import {
  ARTICLE_COVER_IMAGE_API_PATH,
  Editor,
  ImageInput,
  ImageView,
  useArticle,
} from '@siku-zangu/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { Article, ArticleStatus, Language } from '@siku-zangu/core';
import { useParams, useRouter } from 'next/navigation';

export default function ArticlePage() {
  const _router = useRouter();
  const _params = useParams<{ article_id: string }>();
  const [_articleId, _setArticleId] = useState<string>();
  const [_isLoading, _setIsLoading] = useState<boolean>();
  const [_coverImage, _setCoverImage] = useState<File>();
  const [_coverImageSrc, _setCoverImageSrc] = useState<string>();
  const [_content, _setContent] = useState<string>();
  const [_showSuccessModal, _setShowSuccessModal] = useState<boolean>(false);
  const [_articleFormData, _setArticleFormData] = useState<Article>({
    kv: {
      slug: '',
      title: '',
      status: 'draft',
      category: '',
      content: '',
    },
  });
  const {
    article,
    isFetchingArticle,
    isCreatingArticle,
    isUpdatingArticle,
    createArticle,
    updateArticle,
  } = useArticle(_articleId);

  const _handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    _setArticleFormData({
      kv: { ..._articleFormData.kv, title: e.target.value },
    });
  };

  const _handleChangeSlug = (e: ChangeEvent<HTMLInputElement>) => {
    _setArticleFormData({
      kv: { ..._articleFormData.kv, slug: e.target.value },
    });
  };

  const _handleChangeContent = (v: string) => {
    _setArticleFormData({ kv: { ..._articleFormData.kv, content: v } });
  };

  const _handleChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    _setArticleFormData({
      kv: { ..._articleFormData.kv, status: e.target.value as ArticleStatus },
    });
  };

  const _handleChangeCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    _setArticleFormData({
      kv: { ..._articleFormData.kv, category: e.target.value },
    });
  };

  const _handleChangeLanguage = (e: ChangeEvent<HTMLInputElement>) => {
    _setArticleFormData({
      kv: { ..._articleFormData.kv, language: e.target.value as Language },
    });
  };

  const _handlePublishBtnClick = () => {
    if (_articleId === 'new') {
      return createArticle(_articleFormData, _coverImage)
          .then((a) => {
            _setCoverImage(undefined);
            _setShowSuccessModal(true);
            setTimeout(() => {
              _router.push('/dashboard/articles');
            }, 2000);
          })
          .catch(console.error);
    }

    updateArticle(_articleFormData, _coverImage)
        .then(() => {
          _setCoverImage(undefined);
          _setShowSuccessModal(true);
          setTimeout(() => {
            _router.push('/dashboard/articles');
          }, 2000);
        })
        .catch(console.error);
  };

  const _handleCloseModal = () => {
    _setShowSuccessModal(false);
    _router.push('/dashboard/articles');
  };

  useEffect(() => _setArticleId(_params.article_id), [_params]);
  useEffect(() => {
    if (_coverImage) _setCoverImageSrc(URL.createObjectURL(_coverImage));
  }, [_coverImage]);

  useEffect(() => {
    if (!article || !article.kv) return;
    if (article.kv.has_cover_image)
      _setCoverImageSrc(ARTICLE_COVER_IMAGE_API_PATH(_articleId));
    _setArticleFormData({
      kv: {
        slug: article.kv.slug,
        title: article.kv.title,
        status: article.kv.status ?? 'draft',
        category: article.kv.category ?? '',
        content: article.kv.content ?? '',
        language: article.kv.language ?? 'sw',
      },
    });
  }, [article]);

  useEffect(
    () =>
      _setIsLoading(
        isFetchingArticle || isUpdatingArticle || isCreatingArticle
      ),
    [isFetchingArticle, isUpdatingArticle, isCreatingArticle]
  );

  return (
      <>
    <div className="w-full p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="flex flex-col items-start gap-2 w-full">
            <Label htmlFor="article_title" className="text-base text-gray-700">
              Title
            </Label>
            <TextInput
              id="article_title"
              type="text"
              className="w-full"
              placeholder="Enter article title"
              value={_articleFormData?.kv?.title}
              onChange={_handleChangeTitle}
            />
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label htmlFor="article_slug" className="text-base text-gray-700">
              Slug
            </Label>
            <TextInput
              applyTheme="merge"
              id="article_slug"
              type="text"
              className="w-full"
              sizing="md"
              addon="/"
              placeholder="Enter article slug"
              value={_articleFormData?.kv?.slug}
              onChange={_handleChangeSlug}
            />
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label
              htmlFor="article_content"
              className="text-base text-gray-700"
            >
              Content
            </Label>
            <Editor
              id="article_content"
              content={_articleFormData.kv?.content}
              loading={_isLoading}
              onChange={_handleChangeContent}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-start gap-2 w-full">
            <Label htmlFor="article_status" className="text-base text-gray-700">
              Status
            </Label>
            <Select
              id="article_status"
              required
              className="w-full"
              value={_articleFormData?.kv?.status}
              onChange={_handleChangeStatus}
            >
              <option disabled>Select article status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label htmlFor="article_status" className="text-base text-gray-700">
              Category
            </Label>
            <Select
              id="article_status"
              required
              className="w-full"
              value={_articleFormData?.kv?.category}
              onChange={_handleChangeCategory}
            >
              <option disabled>Select article category</option>
              <option value="flow">Period flow</option>
              <option value="health_and_medication">Health & medication</option>
              <option value="nutrition">Food cravings & diet</option>
            </Select>
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            <Label
              htmlFor="article_language"
              className="text-base text-gray-700"
            >
              Language
            </Label>
            <div id="article_language" className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Radio
                  id="article_language_en"
                  name="article_language"
                  value="en"
                  checked={_articleFormData?.kv?.language === 'en'}
                  onChange={_handleChangeLanguage}
                />
                <Label
                  htmlFor="article_language_en"
                  className="text-sm text-gray-700"
                >
                  English
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="article_language_sw"
                  name="article_language"
                  value="sw"
                  color="primary"
                  checked={_articleFormData?.kv?.language === 'sw'}
                  onChange={_handleChangeLanguage}
                />
                <Label
                  htmlFor="article_language_sw"
                  className="text-sm text-gray-700"
                >
                  Kiswahili
                </Label>
              </div>
            </div>
          </div>

          {_coverImageSrc && (
            <ImageView
              src={_coverImageSrc}
              alt={_coverImageSrc}
              onDelete={() => _setCoverImageSrc('')}
            />
          )}
          {!_coverImageSrc && <ImageInput onChange={_setCoverImage} />}

          <div className="grid grid-cols-2 gap-6">
            <Button
              disabled={_isLoading}
              color="secondary"
              className="gap-4"
              onClick={_handlePublishBtnClick}
            >
              {_isLoading && <Spinner size={'md'} color={'gray'} />}
              <span>Save</span>
            </Button>
            <Button as="a" href="/dashboard/articles">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  <Modal
      show={_showSuccessModal}
      onClose={_handleCloseModal}
      size="md"
      popup
  >
    <Modal.Body>
      <div className="text-center py-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Article Saved Successfully!
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Your article has been {_articleId === 'new' ? 'created' : 'updated'} successfully.
        </p>
        <Button
            color="secondary"
            onClick={_handleCloseModal}
            className="w-full"
        >
          Go to Articles
        </Button>
      </div>
    </Modal.Body>
  </Modal>
</>
);
}
