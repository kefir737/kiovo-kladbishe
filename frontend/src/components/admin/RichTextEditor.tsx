interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full border rounded px-3 py-2 font-mono text-sm"
    />
  );
}
