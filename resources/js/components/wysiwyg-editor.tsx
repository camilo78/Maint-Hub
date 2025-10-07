import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Table as TableIcon, Undo, Redo } from 'lucide-react';
import { useCallback } from 'react';

interface Props {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

export default function WysiwygEditor({ content, onChange, placeholder, className }: Props) {
    const handleUpdate = useCallback(({ editor }: any) => {
        const html = editor.getHTML();
        onChange(html);
    }, [onChange]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content || '<p></p>',
        onUpdate: handleUpdate,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3 border-0',
            },
        },
    }, []);

    if (!editor) {
        return (
            <div className={`border border-input rounded-md ${className}`}>
                <div className="h-10 bg-muted/50 border-b border-input animate-pulse"></div>
                <div className="min-h-[120px] p-3 animate-pulse bg-muted/20"></div>
            </div>
        );
    }

    return (
        <div className={`border border-input rounded-md ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-input bg-muted/50 flex-wrap">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-accent' : ''}`}
                    title="Negrita"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-accent' : ''}`}
                    title="Cursiva"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-accent' : ''}`}
                    title="Lista con viñetas"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-accent' : ''}`}
                    title="Lista numerada"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className="h-8 w-8 p-0"
                    title="Insertar tabla"
                >
                    <TableIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0"
                    title="Deshacer"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0"
                    title="Rehacer"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor */}
            <div className="min-h-[120px]">
                <EditorContent 
                    editor={editor}
                    className="[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:w-full [&_table]:my-4 [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:min-w-[100px] [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:font-semibold dark:[&_th]:bg-gray-800 dark:[&_table]:border-gray-600 dark:[&_td]:border-gray-600 dark:[&_th]:border-gray-600"
                />
            </div>
        </div>
    );
}