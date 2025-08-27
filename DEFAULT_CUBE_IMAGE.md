# Default Cube Image Feature

## Overview

This feature replaces the external Picsum image service with a local, consistent default image for cube event detail pages. The default image is an SVG illustration featuring people holding a TV with anonymous masks, representing the collaborative and anonymous nature of cube events. The image is intentionally not displayed in the cube list view to maintain a clean, compact design.

## Implementation Details

### 1. Default Image File

- **Location**: `public/default-cube-image.svg`
- **Dimensions**: 1200x400 pixels (responsive)
- **Format**: SVG (scalable vector graphics)
- **Content**: Illustration of people holding a TV with anonymous masks
- **Design**: Clean, modern aesthetic that matches the application's design system

### 2. Components Updated

#### CubeDetail Component (`src/components/CubeDetail.tsx`)

- **Before**: Used `https://picsum.photos/seed/${event.id}/1200/400`
- **After**: Uses `/default-cube-image.svg`
- **Benefit**: Consistent image across all events, no external dependencies

#### CubeCard Component (`src/components/CubeCard.tsx`)

- **Before**: No event images displayed
- **After**: No event images displayed (kept clean for list view)
- **Benefit**: Maintains clean, compact list view while detail pages show the image

### 3. Technical Benefits

- **No External Dependencies**: Eliminates reliance on Picsum service
- **Faster Loading**: Local SVG loads instantly
- **Consistent Branding**: Same image across all events maintains visual consistency
- **Offline Capability**: Works without internet connection
- **Scalable**: SVG format ensures crisp display at any size
- **Small File Size**: SVG is lightweight and efficient

### 4. Image Design Elements

The default image includes:

- **TV Screen**: Central focal point representing the event
- **Anonymous Masks**: Three people with white masks (representing anonymity)
- **Collaborative Theme**: People working together to hold the TV
- **Modern Aesthetics**: Clean lines, gradients, and professional appearance
- **Brand Consistency**: Matches the application's color scheme and design language

### 5. Usage

The default image is automatically used for:

- All cube event detail pages
- Any future components that need to display cube event images

**Note**: The image is intentionally not displayed in the cube list view to maintain a clean, compact design.

### 6. Customization

To change the default image:

1. Replace `public/default-cube-image.svg` with a new SVG file
2. Ensure the new file has the same dimensions (1200x400) for optimal display
3. Maintain the same filename or update the component references

### 7. Future Enhancements

Potential improvements could include:

- Event-specific image uploads for organizers
- Different default images for different event types (Chapter, Regional, Global)
- Image cropping and optimization tools
- Integration with the existing avatar upload system

## File Structure

```
public/
└── default-cube-image.svg    # Default cube event image
src/
├── components/
│   ├── CubeDetail.tsx        # Updated to use default image
│   └── CubeCard.tsx          # No changes (keeps clean list view)
```

## Browser Compatibility

- **SVG Support**: All modern browsers support SVG images
- **Fallback**: If SVG fails to load, the image area will be empty but functional
- **Responsive**: Image scales appropriately on all device sizes
