import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { convertToEmbedUrl, getVideoThumbnail } from '@/utils/videoUtils';

interface VideoPreviewProps {
  url: string;
  title?: string;
}

export const VideoPreview = ({ url, title = 'Preview do Vídeo' }: VideoPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  
  if (!url) {
    return null;
  }

  const videoInfo = convertToEmbedUrl(url);
  const thumbnail = getVideoThumbnail(url);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Preview do Vídeo</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePreview}
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Ocultar
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Mostrar
            </>
          )}
        </Button>
      </div>

      {showPreview && (
        <Card>
          <CardContent className="p-4">
            {!videoInfo.isValid ? (
              <div className="text-center py-4">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm font-medium">URL não suportada</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Suportamos URLs do YouTube e Vimeo
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir URL
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {videoInfo.platform.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {videoInfo.videoId}
                  </span>
                </div>
                
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {thumbnail ? (
                    <div 
                      className="w-full h-full bg-cover bg-center flex items-center justify-center cursor-pointer"
                      style={{ backgroundImage: `url(${thumbnail})` }}
                      onClick={() => window.open(url, '_blank')}
                    >
                      <div className="bg-black/50 rounded-full p-3">
                        <ExternalLink className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={videoInfo.embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={title}
                    />
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir no {videoInfo.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};