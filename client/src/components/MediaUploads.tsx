import axios from 'axios';

interface MediaProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function MediaUploads({ onUpload, disabled }: MediaProps) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'userAvatar');

    try {
      const res = await axios.post<{ secure_url: string }>(
        'https://api.cloudinary.com/v1_1/dzmcyhnaq/auto/upload',
        formData
      );
      onUpload(res.data.secure_url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <input
      type="file"
      accept="image/*,video/*"
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
