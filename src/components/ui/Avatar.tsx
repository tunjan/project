import React, { useRef } from 'react';
import { CameraIcon } from '@/icons';
import { validateImageFile, createImagePreview } from '@/utils/fileUpload';
import { toast } from 'sonner';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  editable?: boolean;
  onImageChange?: (imageUrl: string) => void;
}

const DefaultAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`flex items-center justify-center bg-grey-200 text-white ${className}`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3/5 w-3/5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  className,
  editable = false,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      // Create preview and call the callback
      const imageUrl = await createImagePreview(file);
      onImageChange?.(imageUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const avatarContent = src ? (
    <img src={src} alt={alt} className={className} />
  ) : (
    <DefaultAvatar className={className} />
  );

  if (!editable) {
    return avatarContent;
  }

  return (
    <div className="group relative">
      {avatarContent}

      {/* Small camera icon indicator */}
      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary">
        <CameraIcon className="h-3 w-3 text-white" />
      </div>

      {/* Upload overlay */}
      <div
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleUploadClick}
        title="Click to upload new avatar image"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleUploadClick();
          }
        }}
      >
        <CameraIcon className="h-8 w-8 text-white" />
        <span className="sr-only">Upload new avatar</span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default Avatar;
