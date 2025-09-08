import { useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface VideoTrackingOptions {
  contentId: string;
  userId: string;
  videoId: string;
  completionThreshold?: number; // Percentage to consider video as completed (default: 80)
  progressInterval?: number; // Interval to save progress in seconds (default: 15)
}

interface VideoProgress {
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
}

export function useVideoTracking({
  contentId,
  userId,
  videoId,
  completionThreshold = 80,
  progressInterval = 15
}: VideoTrackingOptions) {
  const { updateUserProgress, userProgress } = useAppStore();
  const lastSavedTime = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Get current progress for this content
  const currentProgress = userProgress.find(
    p => p.userId === userId && p.contentId === contentId
  );

  const saveProgress = useCallback((progress: VideoProgress) => {
    const shouldSave = Math.abs(progress.currentTime - lastSavedTime.current) >= progressInterval;
    
    if (shouldSave || progress.completed) {
      updateUserProgress(userId, contentId, {
        completed: progress.completed,
        percentage: progress.percentage,
        lastAccessed: new Date().toISOString()
      });
      
      lastSavedTime.current = progress.currentTime;
    }
  }, [userId, contentId, progressInterval, updateUserProgress]);

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    if (duration <= 0) return;

    const percentage = Math.round((currentTime / duration) * 100);
    const completed = percentage >= completionThreshold;

    const progress: VideoProgress = {
      currentTime,
      duration,
      percentage,
      completed
    };

    saveProgress(progress);
  }, [completionThreshold, saveProgress]);

  const handleVideoEnd = useCallback(() => {
    updateUserProgress(userId, contentId, {
      completed: true,
      percentage: 100,
      lastAccessed: new Date().toISOString()
    });
  }, [userId, contentId, updateUserProgress]);

  const startTracking = useCallback((getCurrentTime: () => number, getDuration: () => number) => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Set up periodic progress tracking
    progressIntervalRef.current = setInterval(() => {
      const currentTime = getCurrentTime();
      const duration = getDuration();
      
      if (currentTime > 0 && duration > 0) {
        handleTimeUpdate(currentTime, duration);
      }
    }, progressInterval * 1000);
  }, [handleTimeUpdate, progressInterval]);

  const stopTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    currentProgress,
    handleTimeUpdate,
    handleVideoEnd,
    startTracking,
    stopTracking,
    saveProgress
  };
}