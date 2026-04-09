import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/uploadImage';
import { toast } from 'sonner';

interface ImageUploaderProps {
  value: string | null | undefined;
  folder: 'products' | 'categories';
  onUpload: (url: string) => void;
  onClear?: () => void;
}

export function ImageUploader({ value, folder, onUpload, onClear }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onUpload(url);
      toast.success('Изображение загружено');
    } catch {
      toast.error('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Превью"
            className="h-24 w-24 rounded-lg object-cover border"
          />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ) : (
        <div
          className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={20} />
          <span className="mt-1 text-xs">Загрузить</span>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Загрузка...' : value ? 'Заменить' : 'Выбрать файл'}
      </Button>
    </div>
  );
}
