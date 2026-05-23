import { useState } from 'react';
import { uploadStl } from '../../services/stlService';
import type { StlFile } from '../../types/stl';

interface StlUploaderProps {
  onUploaded: (stl: StlFile) => void;
}

export default function StlUploader({ onUploaded }: StlUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.stl')) {
      setError('请上传 .stl 格式的文件');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('STL 文件不能超过 20MB');
      return;
    }
    setUploading(true);
    try {
      const stl = await uploadStl(file);
      onUploaded(stl);
    } catch {
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label
        style={{
          display: 'block',
          padding: 'var(--space-2) var(--space-4)',
          background: uploading ? 'var(--surface-warm)' : 'var(--accent)',
          color: uploading ? 'var(--muted)' : 'var(--accent-on)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
        }}
      >
        {uploading ? '上传中...' : '上传 STL 模型'}
        <input
          type="file"
          accept=".stl"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={uploading}
        />
      </label>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 4 }}>{error}</p>
      )}
      <p style={{ color: 'var(--meta)', fontSize: 'var(--text-xs)', marginTop: 4 }}>
        支持二进制和 ASCII 格式，最大 20MB
      </p>
    </div>
  );
}
