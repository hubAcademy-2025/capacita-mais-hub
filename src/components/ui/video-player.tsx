import { useState } from 'react';
import { Play, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { convertToEmbedUrl, getVideoThumbnail, extractYouTubeId } from '@/utils/videoUtils';
import { YouTubePlayerComponent } from './youtube-player';

interface VideoPlayerProps {
  url: string;
  title: string;
  duration?: string;
  className?: string;
  contentId?: string;
  userId?: string;
  enableTracking?: boolean;
}

export const VideoPlayer = ({ 
  url, 
  title, 
  duration, 
  className = '', 
  contentId, 
  userId, 
  enableTracking = false 
}: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const videoInfo = convertToEmbedUrl(url);
  const thumbnail = getVideoThumbnail(url);
  const youtubeId = extractYouTubeId(url);

  // Use YouTube Player with tracking if enabled and it's a YouTube video
  if (enableTracking && youtubeId && contentId && userId) {
    return (
      <YouTubePlayerComponent
        url={url}
        title={title}
        duration={duration}
        className={className}
        contentId={contentId}
        userId={userId}
      />
    );
  }

  if (!url) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <Play className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium">Nenhum vídeo configurado</p>
          <p className="text-sm">URL do vídeo não foi fornecida</p>
        </div>
      </div>
    );
  }

  if (!videoInfo.isValid) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-semibold mb-2">URL de vídeo não suportada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Atualmente suportamos URLs do YouTube e Vimeo. Verifique se a URL está correta.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">URL fornecida:</p>
              <code className="text-xs bg-muted p-2 rounded block break-all">
                {url}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir em nova aba
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-semibold mb-2">Erro ao carregar vídeo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não foi possível carregar o vídeo. Verifique se a URL está correta e se o vídeo existe.
            </p>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="mx-auto">
                {videoInfo.platform.toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no {videoInfo.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {/* Loading placeholder with thumbnail */}
        {!isLoaded && thumbnail && (
          <div 
            className="absolute inset-0 bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${thumbnail})` }}
          >
            <div className="bg-black/50 rounded-full p-4">
              <Play className="w-16 h-16 text-white" />
            </div>
          </div>
        )}
        
        {/* Video iframe */}
        <iframe
          src={videoInfo.embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </div>
      
      {/* Video info overlay */}
      <div className="absolute top-2 right-2 flex gap-2">
        <Badge variant="secondary" className="bg-black/70 text-white">
          {videoInfo.platform.toUpperCase()}
        </Badge>
        {duration && (
          <Badge variant="secondary" className="bg-black/70 text-white">
            {duration}
          </Badge>
        )}
      </div>
    </div>
  );
};