import {FileInput, Label} from "flowbite-react";
import {CloudArrowUpIcon, TrashIcon} from "@heroicons/react/24/outline";
import {ChangeEvent} from "react";

export function ImageInput({onChange}: { onChange?: (file: File) => void }) {
    const _handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
        if (onChange && e.target.files && e.target.files[0]) onChange(e.target.files[0]);
    }

    return (
        <div className="flex w-full items-center justify-center">
            <Label
                htmlFor="dropzone-file"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 hover:bg-gray-100"
            >
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <CloudArrowUpIcon className='size-12 text-gray-400'/>
                    <p className="mb-2 text-sm text-gray-500">
                        <span>Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-5000">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <FileInput id="dropzone-file" className="hidden" onChange={_handleChangeFile}/>
            </Label>
        </div>
    );
}

export function ImageView({src, alt, onDelete}: { src: string, alt?: string, onDelete?: () => void }) {
    return (
        <div className='rounded-lg border border-dashed border-gray-300 relative'>
            <img src={src} alt={alt} className='h-64 object-cover w-full rounded-lg'/>
            <button onClick={onDelete}
                    className='absolute bottom-0 right-0 mb-2 mr-2 text-red-600 bg-red-200 p-1 rounded'>
                <TrashIcon className="size-4 stroke-2"/>
            </button>
        </div>
    )
}
