import axios from 'axios';
import React, { useRef } from 'react';

export interface avatarProps {
  onUpload: (url: string) => void;
  preview: string;
  setPreview: (preview: string) => void;
}

export function UserAvatar({ onUpload, preview, setPreview }: avatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'userAvatar');
    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dzmcyhnaq/image/upload',
        formData
      );
      const imageUrl = res.data.secure_url;
      setPreview(imageUrl);
      onUpload(imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <img
        src={preview || '/images/AvatarDefault'}
        alt="picture preview"
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: 12,
        }}
      />
      <div>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <button onClick={() => inputRef.current?.click()}>Upload </button>
      </div>
    </div>
  );
}
