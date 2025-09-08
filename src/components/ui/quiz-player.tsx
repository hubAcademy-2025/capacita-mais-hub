import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  RotateCcw,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuizAttempts, type SecureQuizQuestion } from '@/hooks/useQuizAttempts';
import type { Quiz, QuizQuestion } from '@/types';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (score: number, answers: Record<string, any>) => void;
  onMarkCompleted?: () => void;
}

interface QuizAnswer {
  questionId: string;
  answer: string | string[] | number;
  isCorrect: boolean;
  points: number;
}

export const QuizPlayer = ({ quiz, onComplete, onMarkCompleted }: QuizPlayerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [showResults, setShowResults] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const { toast } = useToast();
  const { getQuizQuestionsForAttempt, getQuizQuestionsWithAnswers } = useQuizAttempts();
  
  // Fetch secure quiz questions without answers for taking the quiz
  const [secureQuestions, setSecureQuestions] = useState<SecureQuizQuestion[]>([]);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<SecureQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        const questions = await getQuizQuestionsForAttempt(quiz.id);
        setSecureQuestions(questions);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizQuestions();
  }, [quiz.id, getQuizQuestionsForAttempt]);

  const currentQuestion = secureQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === secureQuestions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / secureQuestions.length) * 100;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando quiz...</p>
        </div>
      </div>
    );
  }

  if (!secureQuestions.length) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Nenhuma pergunta encontrada para este quiz.</p>
      </div>
    );
  }

  // Timer
  useEffect(() => {
    if (timeLeft && timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const checkAnswer = (question: SecureQuizQuestion, userAnswer: any): boolean => {
    if (!userAnswer || !question.correct_answer) return false;

    switch (question.type) {
      case 'single-choice':
      case 'true-false':
      case 'text':
        return userAnswer.toString().toLowerCase() === question.correct_answer.toString().toLowerCase();
      
      case 'number':
        return parseFloat(userAnswer) === parseFloat(question.correct_answer.toString());
      
      case 'multiple-choice':
        const correctAnswers = Array.isArray(question.correct_answer) 
          ? question.correct_answer 
          : [question.correct_answer];
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        return correctAnswers.length === userAnswers.length &&
               correctAnswers.every(ans => userAnswers.includes(ans));
      
      default:
        return false;
    }
  };

  const calculateScore = () => {
    const results: QuizAnswer[] = [];
    let totalPoints = 0;
    let earnedPoints = 0;

    secureQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      
      totalPoints += question.points;
      if (isCorrect) {
        earnedPoints += question.points;
      }

      results.push({
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0
      });
    });

    const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    setQuizAnswers(results);
    setScore(finalScore);
    return finalScore;
  };

  const handleNext = () => {
    if (currentQuestionIndex < secureQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setIsCompleted(true);
    setShowResults(true);
    
    const passed = finalScore >= quiz.passingScore;
    
    toast({
      title: passed ? "Parabéns!" : "Quiz Concluído",
      description: passed 
        ? `Você passou com ${finalScore.toFixed(1)}%!` 
        : `Você obteve ${finalScore.toFixed(1)}%. Nota mínima: ${quiz.passingScore}%`,
      variant: passed ? "default" : "destructive"
    });

    onComplete(finalScore, answers);
    
    if (passed && onMarkCompleted) {
      onMarkCompleted();
    }
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
    setScore(0);
    setShowResults(false);
    setQuizAnswers([]);
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    
    toast({
      title: "Quiz Reiniciado",
      description: "Boa sorte!"
    });
  };

  const renderQuestion = (question: SecureQuizQuestion) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'single-choice':
        return (
          <RadioGroup 
            value={userAnswer || ''} 
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
                <Label htmlFor={`q${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`q${question.id}-${index}`}
                  checked={(userAnswer || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = userAnswer || [];
                    if (checked) {
                      handleAnswerChange(question.id, [...currentAnswers, option]);
                    } else {
                      handleAnswerChange(question.id, currentAnswers.filter((a: string) => a !== option));
                    }
                  }}
                />
                <Label htmlFor={`q${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <RadioGroup 
            value={userAnswer || ''} 
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`q${question.id}-true`} />
              <Label htmlFor={`q${question.id}-true`}>Verdadeiro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`q${question.id}-false`} />
              <Label htmlFor={`q${question.id}-false`}>Falso</Label>
            </div>
          </RadioGroup>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={userAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Digite sua resposta"
          />
        );

      case 'text':
        return (
          <Textarea
            value={userAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Digite sua resposta"
          />
        );

      default:
        return <div>Tipo de pergunta não suportado</div>;
    }
  };

  if (showResults) {
    const passed = score >= quiz.passingScore;

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle>
            {passed ? 'Parabéns! Você passou!' : 'Quiz Concluído'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {score.toFixed(1)}%
            </div>
            <p className="text-muted-foreground">
              Nota mínima para aprovação: {quiz.passingScore}%
            </p>
          </div>

          <Separator />

          {quiz.showCorrectAnswers && questionsWithAnswers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Revisão das Respostas:</h3>
              {questionsWithAnswers.map((question, index) => {
                const result = quizAnswers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">
                        {index + 1}. {question.question}
                      </h4>
                      <Badge variant={result?.isCorrect ? "default" : "destructive"}>
                        {result?.isCorrect ? 'Correto' : 'Incorreto'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Sua resposta:</strong> {result?.answer?.toString() || 'Não respondida'}
                      </p>
                       <p>
                         <strong>Resposta correta:</strong> {question.correct_answer?.toString()}
                       </p>
                      {question.explanation && (
                        <p className="text-muted-foreground">
                          <strong>Explicação:</strong> {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center gap-4">
            {quiz.allowRetakes && !passed && (
              <Button onClick={handleRetake} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            <Button onClick={() => setShowResults(false)} variant="outline">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            {quiz.title}
          </CardTitle>
          {timeLeft !== null && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>
        {quiz.description && (
          <p className="text-muted-foreground">{quiz.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pergunta {currentQuestionIndex + 1} de {secureQuestions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold leading-relaxed">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h3>
            <Badge variant="secondary">{currentQuestion.points} pts</Badge>
          </div>

          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {isLastQuestion ? (
            <Button onClick={handleSubmitQuiz}>
              Finalizar Quiz
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};