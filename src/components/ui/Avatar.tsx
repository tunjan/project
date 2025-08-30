import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { CameraIcon } from '@/icons';
import { createImagePreview, validateImageFile } from '@/utils/fileUpload';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  editable?: boolean;
  onImageChange?: (imageUrl: string) => void;
}

/**
 * Generate initials from a name (e.g. "Courtney Gusikowski" -> "CG")
 */
const getInitials = (name?: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Deterministic background color generator based on name string
 */
const stringToColor = (str?: string) => {
  if (!str) return '#CBD5E1'; // neutral if no name
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 60% 50%)`;
};

const DefaultAvatar: React.FC<{ name?: string; className?: string }> = ({
  name,
  className,
}) => {
  const initials = getInitials(name);
  const bg = stringToColor(name);
  return (
    <div
      className={`rounded-nonefull flex items-center justify-center text-white ${className}`}
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

  const avatarContent =
    currentSrc && imageErrorCount === 0 ? (
      <img
        src={currentSrc}
        alt={alt}
        className={`rounded-nonefull size-10 object-cover ${className}`}
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
      <div className="rounded-nonefull absolute -bottom-1 -right-1 flex size-6 items-center justify-center border-2 border-white bg-primary">
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
