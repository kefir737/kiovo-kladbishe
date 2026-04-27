import { Editor } from 'react-simple-wysiwyg';
import type { ContentEditableEvent } from 'react-simple-wysiwyg';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const handleChange = (e: ContentEditableEvent) => {
    onChange(e.target.value);
  };

  // Ensure value is always a string
  const stringValue = typeof value === 'string' ? value : '';

  return (
    <Editor
      value={stringValue}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ minHeight: '150px' }}
    />
  );
}
