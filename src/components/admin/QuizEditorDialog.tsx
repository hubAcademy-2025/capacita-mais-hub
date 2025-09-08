import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Quiz, QuizQuestion } from '@/types';

interface QuizEditorDialogProps {
  quiz: Quiz | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (quiz: Quiz) => void;
}

export const QuizEditorDialog = ({ quiz, open, onOpenChange, onSave }: QuizEditorDialogProps) => {
  const [formData, setFormData] = useState<Quiz>({
    id: quiz?.id || '',
    title: quiz?.title || '',
    description: quiz?.description || '',
    questions: quiz?.questions || [],
    timeLimit: quiz?.timeLimit || 30,
    passingScore: quiz?.passingScore || 70,
    allowRetakes: quiz?.allowRetakes ?? true,
    showCorrectAnswers: quiz?.showCorrectAnswers ?? true,
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: '',
    question: '',
    type: 'single-choice',
    options: [''],
    correctAnswer: '',
    explanation: '',
    points: 1,
  });
  
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      id: '',
      question: '',
      type: 'single-choice',
      options: [''],
      correctAnswer: '',
      explanation: '',
      points: 1,
    });
    setEditingQuestionIndex(null);
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt) || []
    }));
  };

  const removeOption = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({
        title: "Erro",
        description: "Digite a pergunta",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: QuizQuestion = {
      ...currentQuestion,
      id: editingQuestionIndex !== null ? currentQuestion.id : Date.now().toString(),
      options: currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'single-choice' 
        ? currentQuestion.options?.filter(opt => opt.trim()) 
        : undefined
    };

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...formData.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        questions: [...prev.questions, newQuestion] 
      }));
    }

    resetCurrentQuestion();
    toast({
      title: "Sucesso",
      description: editingQuestionIndex !== null ? "Pergunta atualizada" : "Pergunta adicionada"
    });
  };

  const editQuestion = (index: number) => {
    const question = formData.questions[index];
    setCurrentQuestion({
      ...question,
      options: question.options || ['']
    });
    setEditingQuestionIndex(index);
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Digite o título do quiz",
        variant: "destructive"
      });
      return;
    }

    if (formData.questions.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos uma pergunta",
        variant: "destructive"
      });
      return;
    }

    const quizToSave = {
      ...formData,
      id: formData.id || Date.now().toString()
    };

    onSave(quizToSave);
    onOpenChange(false);
    toast({
      title: "Sucesso",
      description: "Quiz salvo com sucesso"
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice': return 'Múltipla Escolha';
      case 'single-choice': return 'Escolha Única';
      case 'true-false': return 'Verdadeiro/Falso';
      case 'number': return 'Número';
      case 'text': return 'Texto';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz ? 'Editar Quiz' : 'Criar Quiz'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nome do quiz"
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Tempo Limite (minutos)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do quiz"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="passingScore">Nota Mínima (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowRetakes"
                    checked={formData.allowRetakes}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowRetakes: checked }))}
                  />
                  <Label htmlFor="allowRetakes">Permitir Refazer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showCorrectAnswers"
                    checked={formData.showCorrectAnswers}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showCorrectAnswers: checked }))}
                  />
                  <Label htmlFor="showCorrectAnswers">Mostrar Respostas</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Question */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingQuestionIndex !== null ? 'Editar Pergunta' : 'Adicionar Pergunta'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionType">Tipo de Pergunta</Label>
                  <Select
                    value={currentQuestion.type}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ 
                      ...prev, 
                      type: value as any,
                      options: value === 'multiple-choice' || value === 'single-choice' ? [''] : undefined,
                      correctAnswer: value === 'true-false' ? 'true' : ''
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-choice">Escolha Única</SelectItem>
                      <SelectItem value="multiple-choice">Múltipla Escolha</SelectItem>
                      <SelectItem value="true-false">Verdadeiro/Falso</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="points">Pontos</Label>
                  <Input
                    id="points"
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="question">Pergunta *</Label>
                <Textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Digite sua pergunta"
                />
              </div>

              {/* Options for multiple/single choice */}
              {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'single-choice') && (
                <div>
                  <Label>Opções</Label>
                  <div className="space-y-2">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          disabled={(currentQuestion.options?.length || 0) <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div>
                <Label htmlFor="correctAnswer">Resposta Correta</Label>
                {currentQuestion.type === 'true-false' ? (
                  <Select
                    value={currentQuestion.correctAnswer as string}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Verdadeiro</SelectItem>
                      <SelectItem value="false">Falso</SelectItem>
                    </SelectContent>
                  </Select>
                ) : currentQuestion.type === 'single-choice' ? (
                  <Select
                    value={currentQuestion.correctAnswer as string}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a resposta correta" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.options?.map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option || `Opção ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="correctAnswer"
                    value={currentQuestion.correctAnswer as string}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    placeholder="Digite a resposta correta"
                    type={currentQuestion.type === 'number' ? 'number' : 'text'}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="explanation">Explicação (opcional)</Label>
                <Textarea
                  id="explanation"
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explicação da resposta"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addQuestion}>
                  {editingQuestionIndex !== null ? 'Atualizar Pergunta' : 'Adicionar Pergunta'}
                </Button>
                {editingQuestionIndex !== null && (
                  <Button variant="outline" onClick={resetCurrentQuestion}>
                    Cancelar Edição
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          {formData.questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Perguntas ({formData.questions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                            <Badge variant="secondary">{question.points} pts</Badge>
                          </div>
                          <h4 className="font-medium">{question.question}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => editQuestion(index)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeQuestion(index)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {question.options && (
                        <div className="text-sm text-muted-foreground">
                          <p>Opções: {question.options.join(', ')}</p>
                          <p>Resposta: {question.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Quiz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};