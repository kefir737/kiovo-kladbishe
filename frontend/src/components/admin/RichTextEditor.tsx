import { Editor } from 'react-simple-wysiwyg';
import type { ContentEditableEvent } from 'react-simple-wysiwyg';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const handleChange = (e: ContentEditableEvent) => {
    const newValue = typeof e.target.value === 'string' ? e.target.value : '';
    onChange(newValue);
  };

  const stringValue = typeof value === 'string' ? value : '';

  return (
    <Editor
      value={stringValue}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ minHeight: '150px', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
    />
  );
}
