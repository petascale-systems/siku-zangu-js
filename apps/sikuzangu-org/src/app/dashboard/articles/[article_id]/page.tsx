'use client';

import {
  Button,
  Modal,
  Label,
  Radio,
  Select,
  Spinner,
  TextInput,
  Textarea,
} from 'flowbite-react';
import {ARTICLE_COVER_IMAGE_API_PATH, Editor, ImageInput, ImageView, useArticle} from '@siku-zangu/react';
import { ChangeEvent, useEffect, useState } from 'react';
import {Article, ArticleStatus, Language} from '@siku-zangu/core';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, Trash2 } from 'lucide-react';

export default function ArticlePage() {
  const _router = useRouter();
  const _params = useParams<{ article_id: string }>();
  const [_articleId, _setArticleId] = useState<string>();
  const [_isLoading, _setIsLoading] = useState<boolean>();
  const [_coverImage, _setCoverImage] = useState<File>();
  const [_coverImageSrc, _setCoverImageSrc] = useState<string>();
  const [_content, _setContent] = useState<string>();
  const [_showSuccessModal, _setShowSuccessModal] = useState<boolean>(false);
  const [_showDeleteModal, _setShowDeleteModal] = useState<boolean>(false);
  const [_articleFormData, _setArticleFormData] = useState<Article>({
    kv: {
      slug: '',
      title: '',
      status: 'draft',
      category: '',
      content: '',
      references: [],
    },
  });
  const [_referencesText, _setReferencesText] = useState<string>('');
  const {
    article,
    isFetchingArticle,
    isCreatingArticle,
    isUpdatingArticle,
    isDeletingArticle,
    createArticle,
    updateArticle,
    deleteArticle,
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

  const _handleChangeReferences = (e: ChangeEvent<HTMLTextAreaElement>) => {
    _setReferencesText(e.target.value);
    const references = e.target.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    _setArticleFormData({
      kv: { ..._articleFormData.kv, references },
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

  const _handleConfirmDelete = () => {
    deleteArticle()
      .then(() => {
        _setShowDeleteModal(false);
        _router.push('/dashboard/articles');
      })
      .catch(console.error);
  };

  useEffect(() => _setArticleId(_params.article_id), [_params]);
  useEffect(() => {
    if (_coverImage) _setCoverImageSrc(URL.createObjectURL(_coverImage));
  }, [_coverImage]);

  useEffect(() => {
    if (!article || !article.kv) return;
    if (article.kv.has_cover_image)
      _setCoverImageSrc(ARTICLE_COVER_IMAGE_API_PATH(_articleId));
    const references = article.kv.references ?? [];
    _setArticleFormData({
      kv: {
        slug: article.kv.slug,
        title: article.kv.title,
        status: article.kv.status ?? 'draft',
        category: article.kv.category ?? '',
        content: article.kv.content ?? '',
        language: article.kv.language ?? 'sw',
        references,
      },
    });
    _setReferencesText(references.join('\n'));
  }, [article]);

  useEffect(
    () =>
      _setIsLoading(
        isFetchingArticle || isUpdatingArticle || isCreatingArticle || isDeletingArticle
      ),
    [isFetchingArticle, isUpdatingArticle, isCreatingArticle, isDeletingArticle]
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

          <div className="flex flex-col items-start gap-2 w-full">
            <Label
              htmlFor="article_references"
              className="text-base text-gray-700"
            >
              References / Citations
            </Label>
            <p className="text-xs text-gray-500">
              One citation per line. Include credible sources (peer-reviewed
              journals, WHO, MoH, etc.) for any medical claims. Required for
              health and medication content.
            </p>
            <Textarea
              id="article_references"
              className="w-full"
              rows={6}
              placeholder={
                'e.g. Symul L, Wac K, Hillard P et al. Assessment of menstrual health status... npj Digit. Med. 2, 64 (2019). https://doi.org/10.1038/s41746-019-0139-4'
              }
              value={_referencesText}
              onChange={_handleChangeReferences}
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
              id="article_category"
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
          {_articleId !== 'new' && (
            <Button
              color="red"
              outline
              disabled={_isLoading}
              className="w-full gap-2"
              onClick={() => _setShowDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete article</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  <Modal
      show={_showDeleteModal}
      onClose={() => _setShowDeleteModal(false)}
      size="md"
      popup
  >
      <div className="text-center py-6 px-4">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <Trash2 className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Delete this article?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          This will permanently remove the article and its references from the database. This action cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button
              color="gray"
              outline
              onClick={() => _setShowDeleteModal(false)}
              disabled={isDeletingArticle}
          >
            Cancel
          </Button>
          <Button
              color="red"
              onClick={_handleConfirmDelete}
              disabled={isDeletingArticle}
              className="gap-2"
          >
            {isDeletingArticle && <Spinner size={'sm'} color={'gray'} />}
            <span>Delete</span>
          </Button>
        </div>
      </div>
  </Modal>
  <Modal
      show={_showSuccessModal}
      onClose={_handleCloseModal}
      size="md"
      popup
  >
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
  </Modal>
</>
);
}
