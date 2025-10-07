import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'

interface Props {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    className?: string
}

export default function TipTapEditor({ content, onChange, placeholder, className }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            BulletList,
            OrderedList,
            ListItem,
            Placeholder.configure({
                placeholder: placeholder || 'Escriba sus notas aquí...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) return null

    return (
        <div className={`border border-input rounded-md bg-background ${className}`}>
            <div className="flex items-center gap-1 p-2 border-b border-input bg-muted/50">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 hover:bg-accent rounded ${editor.isActive('bold') ? 'bg-accent' : ''}`}
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 hover:bg-accent rounded ${editor.isActive('italic') ? 'bg-accent' : ''}`}
                >
                    <Italic className="h-4 w-4" />
                </button>
                <div className="w-px h-4 bg-border mx-1"></div>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1 hover:bg-accent rounded ${editor.isActive('bulletList') ? 'bg-accent' : ''}`}
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1 hover:bg-accent rounded ${editor.isActive('orderedList') ? 'bg-accent' : ''}`}
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
            </div>
            <EditorContent 
                editor={editor} 
                className="prose prose-sm max-w-none p-3 min-h-[100px] focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[100px] [&_.ProseMirror-focused]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-4 [&_.ProseMirror_li]:mb-1 dark:prose-invert" 
            />
        </div>
    )
}