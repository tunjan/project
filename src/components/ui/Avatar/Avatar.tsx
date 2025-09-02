import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { CameraIcon } from '@/icons';
import { readFileAsDataURL, validateImageFile } from '@/utils';
import { getInitials, stringToColor } from '@/utils';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  editable?: boolean;
  onImageChange?: (imageUrl: string) => void;
}

const DefaultAvatar: React.FC<{ name?: string; className?: string }> = ({
  name,
  className,
}) => {
  const initials = getInitials(name);
  const bg = stringToColor(name);
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white ${className}`}
      role="img"
      aria-label={name ? `${name} avatar` : 'Default user avatar'}
      style={{
        backgroundColor: bg,
        width: '40px',
        height: '40px',
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      <span>{initials || 'U'}</span>
    </div>
  );
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  className,
  editable = false,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageErrorCount, setImageErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string | null | undefined>(src);

  // Keep currentSrc in sync if the src prop changes (e.g., after async load or update)
  useEffect(() => {
    setCurrentSrc(src);
    setImageErrorCount(0);
  }, [src]);

  const handleImageError = () => {
    // Increment error count; after first failure we stop attempting remote loads
    setImageErrorCount((c) => c + 1);
    // Clear currentSrc so we render the local inline SVG fallback (initials)
    setCurrentSrc(null);
  };

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
      const imageUrl = await readFileAsDataURL(file);
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

  const avatarContent =
    currentSrc && imageErrorCount === 0 ? (
      <img
        src={currentSrc}
        alt={alt}
        className={`size-10 rounded-full object-cover ${className}`}
        onError={handleImageError}
      />
    ) : (
      // Use inline initials-based fallback to avoid CORS
      <DefaultAvatar name={alt} className={className} />
    );

  if (!editable) {
    return avatarContent;
  }

  return (
    <div className="group relative">
      {avatarContent}

      {/* Small camera icon indicator */}
      <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-white bg-primary md:border-2">
        <CameraIcon className="size-3 text-white" />
      </div>

      {/* Upload overlay */}
      <div
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
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
        <CameraIcon className="size-8 text-white" />
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
