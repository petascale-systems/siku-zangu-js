"use client"

import {EditorContent, useEditor, useEditorState} from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit'
import {
    BoldIcon,
    H1Icon,
    H2Icon,
    H3Icon,
    ItalicIcon,
    ListBulletIcon,
    NumberedListIcon,
    UnderlineIcon
} from '@heroicons/react/24/outline';
import {useEffect} from "react";

export function Editor({id, placeholder, content, loading, onChange}: {
    id?: string,
    placeholder?: string,
    content?: string,
    loading?: boolean,
    onChange?: (value: string) => void
}) {
    const editor = useEditor({
        onUpdate: (value) => {
            if (onChange) onChange(value.editor.getHTML())
        },
        immediatelyRender: false,
        extensions: [StarterKit],
        editorProps: {
            attributes: {
                class: 'focus:outline-none p-3 prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl min-h-56 w-full',
                placeholder: placeholder ?? '',
            },
        },
        content: content,
    })
    const editorState = useEditorState({
        editor,
        selector: ctx => {
            return {
                isBold: ctx?.editor?.isActive('bold') ?? false,
                canBold: ctx?.editor?.can().chain().toggleBold().run() ?? false,
                isItalic: ctx?.editor?.isActive('italic') ?? false,
                canItalic: ctx?.editor?.can().chain().toggleItalic().run() ?? false,
                isUnderline: ctx?.editor?.isActive('underline'),
                isCode: ctx?.editor?.isActive('code') ?? false,
                isParagraph: ctx?.editor?.isActive('paragraph') ?? false,
                isHeading1: ctx?.editor?.isActive('heading', {level: 1}) ?? false,
                isHeading2: ctx?.editor?.isActive('heading', {level: 2}) ?? false,
                isHeading3: ctx?.editor?.isActive('heading', {level: 3}) ?? false,
                isBulletList: ctx?.editor?.isActive('bulletList') ?? false,
                isOrderedList: ctx?.editor?.isActive('orderedList') ?? false,
            }
        },
    })

    useEffect(() => {
        if (!loading) editor?.commands.setContent(content ?? '');
    }, [loading]);

    return (
        <div id={id} className='rounded-lg border border-gray-300 divide-y divide-gray-200 w-full'>
            <div className="flex justify-start items-center gap-3 p-2">
                <button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!editorState?.canBold}
                    className={`p-1 rounded ${editorState?.isBold ? 'bg-secondary-200' : ''}`}
                >
                    <BoldIcon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={!editorState?.canItalic}
                    className={`p-1 rounded ${editorState?.isItalic ? 'bg-secondary-200' : ''}`}
                >
                    <ItalicIcon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className={`p-1 rounded ${editorState?.isUnderline ? 'bg-secondary-200' : ''}`}
                >
                    <UnderlineIcon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().setParagraph().run()}
                    className={`py-1 px-2 rounded ${editorState?.isParagraph ? 'bg-secondary-200' : ''}`}
                >
                    Text
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({level: 1}).run()}
                    className={`p-1 rounded ${editorState?.isHeading1 ? 'bg-secondary-200' : ''}`}
                >
                    <H1Icon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({level: 2}).run()}
                    className={`p-1 rounded ${editorState?.isHeading2 ? 'bg-secondary-200' : ''}`}
                >
                    <H2Icon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({level: 3}).run()}
                    className={`p-1 rounded ${editorState?.isHeading3 ? 'bg-secondary-200' : ''}`}
                >
                    <H3Icon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`p-1 rounded ${editorState?.isBulletList ? 'bg-secondary-200' : ''}`}
                >
                    <ListBulletIcon className='size-5'/>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={editorState?.isOrderedList ? 'is-active' : ''}
                >
                    <NumberedListIcon className='size-5'/>
                </button>
            </div>

            <EditorContent editor={editor}/>
        </div>
    )
}