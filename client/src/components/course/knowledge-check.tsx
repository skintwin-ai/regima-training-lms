import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { QuizResultsModal } from "./quiz-results-modal";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Quiz } from "@/lib/types";

interface KnowledgeCheckProps {
  quiz: Quiz;
  lessonId: number;
  moduleId: number;
  userId?: number;
  onComplete?: (score: number, total: number) => void;
}

export function KnowledgeCheck({ quiz, lessonId, moduleId, userId, onComplete }: KnowledgeCheckProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const updateProgressMutation = useMutation({
    mutationFn: async (quizScore: number) => {
      return await apiRequest('POST', '/api/progress', {
        moduleId,
        lessonId,
        completed: true,
        quizScore
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress/summary'] });
    }
  });

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    const questions = quiz.questions;
    
    for (const question of questions) {
      if (answers[question.id] === question.correctOptionId) {
        correctAnswers++;
      }
    }
    
    const finalScore = correctAnswers;
    const totalQuestions = questions.length;
    
    setScore(finalScore);
    setShowResults(true);
    
    // Update progress if user is logged in
    if (userId) {
      updateProgressMutation.mutate(finalScore);
    }
    
    if (onComplete) {
      onComplete(finalScore, totalQuestions);
    }
  };

  const closeResults = () => {
    setShowResults(false);
  };

  const isSubmitDisabled = quiz.questions.some(q => !answers[q.id]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Knowledge Check</h2>
      <p className="text-muted-foreground mb-6">Test your understanding with this short quiz.</p>
      
      <div className="space-y-6">
        {quiz.questions.map((question) => (
          <Card key={question.id} className="border border-border">
            <CardContent className="pt-6">
              <h3 className="font-medium text-foreground mb-3">{question.question}</h3>
              <RadioGroup 
                value={answers[question.id]} 
                onValueChange={(value) => handleAnswerChange(question.id, value)}
              >
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="font-normal cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
        
        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isSubmitDisabled || updateProgressMutation.isPending}
        >
          Submit Answers
        </Button>
      </div>
      
      <QuizResultsModal
        isOpen={showResults}
        onClose={closeResults}
        score={score}
        total={quiz.questions.length}
      />
    </div>
  );
}

export default KnowledgeCheck;
