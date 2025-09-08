import { useEffect, useRef, useState } from 'react';
import { Play, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { loadYouTubeAPI, PlayerState, type YouTubePlayer } from '@/utils/youtubeApi';
import { useVideoTracking } from '@/hooks/use-video-tracking';
import { extractYouTubeId } from '@/utils/videoUtils';

interface YouTubePlayerProps {
  url: string;
  title: string;
  duration?: string;
  className?: string;
  contentId: string;
  userId: string;
  autoplay?: boolean;
}

export const YouTubePlayerComponent = ({ 
  url, 
  title, 
  duration, 
  className = '',
  contentId,
  userId,
  autoplay = false
}: YouTubePlayerProps) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerId = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

  const videoId = extractYouTubeId(url);
  
  const {
    currentProgress,
    handleTimeUpdate,
    handleVideoEnd,
    startTracking,
    stopTracking
  } = useVideoTracking({
    contentId,
    userId,
    videoId: videoId || '',
    completionThreshold: 80,
    progressInterval: 10
  });

  useEffect(() => {
    if (!videoId) {
      setHasError(true);
      return;
    }

    let mounted = true;

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (!mounted || !playerRef.current) return;

        const ytPlayer = new window.YT.Player(playerId.current, {
          videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 1,
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              if (!mounted) return;
              setPlayer(event.target);
              setIsReady(true);
              setVideoDuration(event.target.getDuration());
              
              // Start tracking when player is ready
              startTracking(
                () => event.target.getCurrentTime(),
                () => event.target.getDuration()
              );
            },
            onStateChange: (event) => {
              if (!mounted) return;
              
              const currentTime = event.target.getCurrentTime();
              const duration = event.target.getDuration();
              
              setCurrentTime(currentTime);
              
              // Handle different player states
              switch (event.data) {
                case PlayerState.PLAYING:
                  handleTimeUpdate(currentTime, duration);
                  break;
                case PlayerState.ENDED:
                  handleVideoEnd();
                  stopTracking();
                  break;
                case PlayerState.PAUSED:
                  handleTimeUpdate(currentTime, duration);
                  break;
              }
            },
            onError: () => {
              if (!mounted) return;
              setHasError(true);
            }
          }
        });

      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
        if (mounted) {
          setHasError(true);
        }
      }
    };

    initializePlayer();

    return () => {
      mounted = false;
      stopTracking();
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [videoId, autoplay, handleTimeUpdate, handleVideoEnd, startTracking, stopTracking, player]);

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

  if (!videoId) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="font-semibold mb-2">URL de vídeo não suportada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta URL não é um vídeo válido do YouTube. Verifique se a URL está correta.
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
                YOUTUBE
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no YouTube
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = currentProgress?.percentage || 0;
  const isCompleted = currentProgress?.completed || false;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <div
            ref={playerRef}
            id={playerId.current}
            className="w-full h-full"
          />
        </div>
        
        {/* Video info overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            YOUTUBE
          </Badge>
          {duration && (
            <Badge variant="secondary" className="bg-black/70 text-white">
              {duration}
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="default" className="bg-green-600">
              Assistido
            </Badge>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Progresso do vídeo</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        {isCompleted && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Vídeo assistido completamente
          </p>
        )}
      </div>
    </div>
  );
};