/**
 * Cloudinary Media Storage Helper (Free Tier Optimized)
 * Supports unsigned client-side uploads and smart URL optimization (thumbnails, quality, responsive formats).
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  format?: string;
}

// Fallback high quality imagery for Balingasag if user tests without Cloudinary API credentials
export const PRESET_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1590059390046-52bb66060c25?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
];

async function sha1Hex(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const getCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '';
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET || '';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
    isConfigured: Boolean(cloudName && (uploadPreset || (apiKey && apiSecret))),
  };
};

/**
 * Generates an ultra-crisp, high-definition (HD 1920px) Cloudinary URL specifically
 * designed for full-screen hero carousels and banners.
 * Automatically upscales, sharpens (e_sharpen:120), and delivers at best quality.
 */
export const getHeroOptimizedUrl = (url: string): string => {
  if (!url) return '';

  // Cloudinary: inject 1920px width, smart fill, auto gravity, best quality, and sharpness
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      // Remove any existing transformations between /upload/ and /v...
      const afterUpload = url.slice(uploadIndex + 8);
      const versionIndex = afterUpload.search(/v\d+\//);
      const cleanPath = versionIndex !== -1 ? afterUpload.slice(versionIndex) : afterUpload;
      const transform = 'w_1920,c_fill,g_auto,q_auto:best,f_auto,e_sharpen:120';
      return `${url.slice(0, uploadIndex)}/upload/${transform}/${cleanPath}`;
    }
  }

  // Unsplash: request 1920px high-resolution parameters
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=1920&q=90`;
  }

  return url;
};

/**
 * Generates an optimized Cloudinary thumbnail or transforms an external image URL
 */
export const getOptimizedMediaUrl = (
  url: string,
  options: { width?: number; height?: number; quality?: number; crop?: string } = {}
): string => {
  if (!url) return '';
  const { width = 800, height = 500, quality = 80, crop = 'fill' } = options;

  // If this is an authentic Cloudinary URL, inject standard transformation flags
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const transform = `c_${crop},w_${width},h_${height},q_${quality},f_auto`;
      return `${url.slice(0, uploadIndex)}/upload/${transform}/${url.slice(uploadIndex + 8)}`;
    }
  }

  // If this is an Unsplash image, use standard Unsplash CDN parameters
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;
  }

  return url;
};

/**
 * Uploads an image file to Cloudinary free tier via unsigned upload preset.
 * If credentials are not set in .env, creates an instant local preview or selects a curated spot photo.
 */
export const uploadToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> => {
  const { cloudName, uploadPreset, apiKey, apiSecret, isConfigured } = getCloudinaryConfig();

  // If user has not yet configured Cloudinary credentials, provide local preview
  if (!isConfigured) {
    if (onProgress) onProgress(35);
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (onProgress) onProgress(75);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          secure_url: reader.result as string,
          public_id: `balingasag_preview_${Date.now()}`,
          thumbnail_url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'balingasag_tourism');

    // If API Key and Secret are available, use signed upload
    if (apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `folder=balingasag_tourism&timestamp=${timestamp}${apiSecret}`;
      const signature = await sha1Hex(stringToSign);

      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
    } else if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    if (onProgress) onProgress(20);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Cloudinary direct upload response issue:', errorText);
      throw new Error(`Upload returned ${response.status}: ${errorText}`);
    }

    if (onProgress) onProgress(90);

    const data = await response.json();
    if (onProgress) onProgress(100);

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      thumbnail_url: getOptimizedMediaUrl(data.secure_url, { width: 400, height: 300 }),
      width: data.width,
      height: data.height,
      format: data.format,
    };
  } catch (err) {
    console.warn('Direct Cloudinary upload error, generating local media preview fallback:', err);
    // Graceful fallback to Data URL preview so admin workflow is never blocked
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({
          secure_url: reader.result as string,
          public_id: `balingasag_local_${Date.now()}`,
          thumbnail_url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    });
  }
};
