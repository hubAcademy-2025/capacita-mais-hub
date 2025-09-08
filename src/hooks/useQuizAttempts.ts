import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  answers: any; // Using any to match Json type from database
}

export interface SecureQuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: Database['public']['Enums']['question_type'];
  options?: any;
  order_index: number;
  points: number;
  correct_answer?: any; // Only available when user can see answers
  explanation?: string; // Only available when user can see answers
}

export const useQuizAttempts = () => {
  const { toast } = useToast();

  const getQuizQuestionsForAttempt = async (quizId: string): Promise<SecureQuizQuestion[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_quiz_questions_for_attempt', { quiz_id_param: quizId });
      
      if (error) {
        console.error('Error fetching quiz questions:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as perguntas do quiz.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar quiz.",
        variant: "destructive",
      });
      return [];
    }
  };

  const getQuizQuestionsWithAnswers = async (quizId: string): Promise<SecureQuizQuestion[]> => {
    try {
      const { data, error } = await supabase
        .rpc('get_quiz_questions_with_answers', { quiz_id_param: quizId });
      
      if (error) {
        console.error('Error fetching quiz questions with answers:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as respostas do quiz.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar respostas do quiz.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createQuizAttempt = async (quizId: string): Promise<QuizAttempt | null> => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          answers: {}
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating quiz attempt:', error);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o quiz.",
          variant: "destructive",
        });
        return null;
      }
      
      return data as QuizAttempt;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao iniciar quiz.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateQuizAttempt = async (
    attemptId: string, 
    answers: Record<string, any>, 
    completed: boolean = false,
    score?: number,
    passed?: boolean
  ): Promise<boolean> => {
    try {
      const updateData: any = { answers };
      
      if (completed) {
        updateData.completed_at = new Date().toISOString();
        if (score !== undefined) updateData.score = score;
        if (passed !== undefined) updateData.passed = passed;
      }

      const { error } = await supabase
        .from('quiz_attempts')
        .update(updateData)
        .eq('id', attemptId);
      
      if (error) {
        console.error('Error updating quiz attempt:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar progresso do quiz.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar progresso.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUserQuizAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('started_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quiz attempts:', error);
        return [];
      }
      
      return (data || []) as QuizAttempt[];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  return {
    getQuizQuestionsForAttempt,
    getQuizQuestionsWithAnswers,
    createQuizAttempt,
    updateQuizAttempt,
    getUserQuizAttempts
  };
};