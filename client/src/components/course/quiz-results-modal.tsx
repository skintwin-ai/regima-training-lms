import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";

interface QuizResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  total: number;
  nextLessonUrl?: string;
}

export function QuizResultsModal({ isOpen, onClose, score, total, nextLessonUrl }: QuizResultsModalProps) {
  const isPassing = score / total >= 0.7; // 70% passing threshold
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Quiz Results</DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4">
          <div className={`w-20 h-20 rounded-full ${isPassing ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center text-2xl mx-auto mb-4`}>
            {isPassing ? <Check className="h-10 w-10" /> : '!'}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isPassing ? 'Well Done!' : 'Almost There!'}
          </h3>
          
          <p className="text-muted-foreground">
            You scored <span className="font-bold text-primary">{score}/{total}</span> on this knowledge check.
          </p>
          
          <p className="text-sm text-muted-foreground mt-2">
            {isPassing 
              ? 'Keep up the good work!'
              : 'Review the material and try again to improve your score.'
            }
          </p>
        </div>
        
        <div className="mt-6 flex justify-center">
          {nextLessonUrl ? (
            <Button asChild>
              <Link href={nextLessonUrl}>
                Continue to Next Lesson
              </Link>
            </Button>
          ) : (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuizResultsModal;
