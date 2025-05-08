import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LessonFeedbackProps {
  lessonId: number;
  userId?: number;
}

export function LessonFeedback({ lessonId, userId }: LessonFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  
  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/feedback', {
        lessonId,
        rating,
        comment
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!"
      });
      setComment("");
      setRating(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "Please log in to submit feedback.",
        variant: "destructive"
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    submitFeedbackMutation.mutate();
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Lesson Feedback</h2>
      
      <p className="text-muted-foreground text-sm mb-4">How helpful was this lesson?</p>
      
      <div className="flex space-x-1 text-2xl text-muted/30 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`${rating >= star ? 'text-yellow-400' : ''} hover:text-yellow-400 transition`}
          >
            ★
          </button>
        ))}
      </div>
      
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your feedback on this lesson..."
        className="min-h-[100px]"
      />
      
      <Button 
        className="w-full mt-3"
        onClick={handleSubmit}
        disabled={submitFeedbackMutation.isPending}
      >
        Submit Feedback
      </Button>
    </div>
  );
}

export default LessonFeedback;
