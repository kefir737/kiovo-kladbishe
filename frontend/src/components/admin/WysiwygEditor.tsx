import { Editor } from '@tinymce/tinymce-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export function WysiwygEditor({ value, onChange, placeholder, height = 200 }: WysiwygEditorProps) {
  return (
    <Editor
      apiKey="your-api-key-or-use-free-cloud"
      value={value}
      init={{
        height,
        menubar: false,
        plugins: 'lists link code table',
        toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px }',
        placeholder,
        branding: false,
        promotion: false,
      }}
      onEditorChange={(content) => onChange(content || '')}
    />
  );
}
