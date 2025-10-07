import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Eye, Edit } from 'lucide-react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SimpleWysiwyg({ value, onChange, placeholder, className }: Props) {
    const [isPreview, setIsPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertText = (before: string, after: string = '') => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        
        onChange(newText);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
        }, 0);
    };

    const insertAtLineStart = (prefix: string) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const lines = value.split('\n');
        let currentLineIndex = 0;
        let charCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= start) {
                currentLineIndex = i;
                break;
            }
            charCount += lines[i].length + 1;
        }
        
        lines[currentLineIndex] = prefix + lines[currentLineIndex];
        const newText = lines.join('\n');
        onChange(newText);
        
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + prefix.length;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    const renderPreview = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside mb-2">$1</ul>')
            .replace(/\n/g, '<br>');
    };

    return (
        <div className={`border border-input rounded-md ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-input bg-muted/50">
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText('**', '**')}
                        className="h-8 w-8 p-0"
                        title="Negrita"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText('*', '*')}
                        className="h-8 w-8 p-0"
                        title="Cursiva"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertAtLineStart('- ')}
                        className="h-8 w-8 p-0"
                        title="Lista"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertAtLineStart('1. ')}
                        className="h-8 w-8 p-0"
                        title="Lista numerada"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                </div>
                
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    className="h-8 px-3"
                >
                    {isPreview ? <Edit className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {isPreview ? 'Editar' : 'Vista previa'}
                </Button>
            </div>

            {/* Editor/Preview */}
            {isPreview ? (
                <div 
                    className="min-h-[120px] p-3 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                />
            ) : (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[120px] w-full p-3 text-sm bg-transparent border-0 resize-y focus:outline-none"
                    rows={5}
                />
            )}
        </div>
    );
}