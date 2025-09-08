/**
 * Utilities for handling video URLs and converting them to embeddable formats
 */

export interface VideoInfo {
  url: string;
  platform: 'youtube' | 'vimeo' | 'unknown';
  isValid: boolean;
  embedUrl?: string;
  videoId?: string;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Extracts Vimeo video ID from various Vimeo URL formats
 */
export const extractVimeoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Converts a video URL to its embeddable format
 */
export const convertToEmbedUrl = (url: string): VideoInfo => {
  if (!url) {
    return {
      url,
      platform: 'unknown',
      isValid: false,
    };
  }

  // Check if it's already an embed URL
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return {
      url,
      platform: url.includes('youtube') ? 'youtube' : 'vimeo',
      isValid: true,
      embedUrl: url,
    };
  }

  // Try YouTube
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      url,
      platform: 'youtube',
      isValid: true,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      videoId: youtubeId,
    };
  }

  // Try Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      url,
      platform: 'vimeo',
      isValid: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      videoId: vimeoId,
    };
  }

  // Unknown format - might be a direct embed URL or unsupported platform
  return {
    url,
    platform: 'unknown',
    isValid: false,
  };
};

/**
 * Validates if a video URL is supported and can be embedded
 */
export const validateVideoUrl = (url: string): boolean => {
  const videoInfo = convertToEmbedUrl(url);
  return videoInfo.isValid;
};

/**
 * Gets the thumbnail URL for a video (YouTube only for now)
 */
export const getVideoThumbnail = (url: string): string | null => {
  const videoInfo = convertToEmbedUrl(url);
  
  if (videoInfo.platform === 'youtube' && videoInfo.videoId) {
    return `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`;
  }
  
  return null;
};

/**
 * Gets a high-quality thumbnail URL for YouTube videos
 */
export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Formats video duration from seconds to human readable format
 */
export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};