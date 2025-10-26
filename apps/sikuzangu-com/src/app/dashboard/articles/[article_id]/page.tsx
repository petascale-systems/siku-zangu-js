'use client'

import {Button, Label, Radio, Select, TextInput} from "flowbite-react";
import {Editor, ImageInput, ImageView} from "@siku-zangu/react";
import {useEffect, useState} from "react";
import {Article} from "@siku-zangu/core";

export default function ArticlePage() {
    const [_coverImage, _setCoverImage] = useState<File>();
    const [_coverImageSrc, _setCoverImageSrc] = useState<string>();
    const [_content, _setContent] = useState<string>();
    const [_articleFormData, _setArticleFormData] = useState<Article>({
        kv: {
            slug: '',
            title: '',
            status: 'draft',
            category: '',
            content: '',
        }
    });

    useEffect(() => {
        if (_coverImage) _setCoverImageSrc(URL.createObjectURL(_coverImage));
    }, [_coverImage]);

    return (
        <div className='w-full p-10'>
            <div className='max-w-7xl mx-auto grid grid-cols-1 gap-6 xl:grid-cols-2'>
                <div className='space-y-6'>
                    <div className='flex flex-col items-start gap-2 w-full'>
                        <Label htmlFor="article_title" className='text-base text-gray-700'>Title</Label>
                        <TextInput id="article_title" type="text" className='w-full' placeholder='Enter article title'/>
                    </div>

                    <div className='flex flex-col items-start gap-2 w-full'>
                        <Label htmlFor="article_slug" className='text-base text-gray-700'>Slug</Label>
                        <TextInput applyTheme='merge' id="article_slug" type="text" className='w-full' sizing='md'
                                   addon='/' placeholder='Enter article slug'/>
                    </div>

                    <Editor placeholder='Write your content here ...' content={_content} onChange={_setContent}/>
                </div>

                <div className='space-y-6'>
                    <div className='flex flex-col items-start gap-2 w-full'>
                        <Label htmlFor="article_status" className='text-base text-gray-700'>Status</Label>
                        <Select id="article_status" required className='w-full'>
                            <option disabled>Select article status</option>
                            <option>Draft</option>
                            <option>Scheduled</option>
                            <option>Published</option>
                        </Select>
                    </div>

                    <div className='flex flex-col items-start gap-2 w-full'>
                        <Label htmlFor="article_status" className='text-base text-gray-700'>Category</Label>
                        <Select id="article_status" required className='w-full'>
                            <option disabled>Select article status</option>
                            <option>Draft</option>
                            <option>Scheduled</option>
                            <option>Published</option>
                        </Select>
                    </div>

                    <div className='flex flex-col items-start gap-2 w-full'>
                        <Label htmlFor="article_language" className='text-base text-gray-700'>Language</Label>
                        <div id='article_language' className='flex items-center gap-8'>
                            <div className="flex items-center gap-2">
                                <Radio id="article_language_en" name="article_language" value="en" defaultChecked/>
                                <Label htmlFor="article_language_en" className='text-sm text-gray-700'>English</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Radio id="article_language_swa" name="article_language" value="swa" color='primary'/>
                                <Label htmlFor="article_language_swa"
                                       className='text-sm text-gray-700'>Kiswahili</Label>
                            </div>
                        </div>
                    </div>

                    {_coverImageSrc &&
                        <ImageView src={_coverImageSrc} alt={_coverImageSrc} onDelete={() => _setCoverImageSrc('')}/>}
                    {!_coverImageSrc && <ImageInput onChange={_setCoverImage}/>}

                    <div className='grid grid-cols-3 gap-6'>
                        <Button color='secondary'>Publish</Button>
                        <Button color='gray' outline>Save draft</Button>
                        <Button as='a' href='/dashboard/articles'>Cancel</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}