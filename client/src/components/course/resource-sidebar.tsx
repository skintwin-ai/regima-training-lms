import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Play, 
  ListChecks 
} from "lucide-react";
import { type Resource, type Product } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResourceSidebarProps {
  lessonId: number;
  resources: Resource[];
  product?: Product;
  userNote?: string;
  userId?: number;
}

export function ResourceSidebar({ lessonId, resources, product, userNote, userId }: ResourceSidebarProps) {
  const [note, setNote] = useState(userNote || "");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  // Save note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/notes', {
        lessonId,
        content: note
      });
    },
    onSuccess: () => {
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: [`/api/lessons/${lessonId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/feedback', {
        lessonId,
        rating,
        comment: feedback
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!"
      });
      setFeedback("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveNote = () => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "Please log in to save notes.",
        variant: "destructive"
      });
      return;
    }
    
    saveNoteMutation.mutate();
  };

  const handleSubmitFeedback = () => {
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="text-red-500 text-xl mr-3" />;
      case 'video':
        return <Play className="text-primary text-xl mr-3" />;
      case 'checklist':
        return <ListChecks className="text-gray-600 text-xl mr-3" />;
      default:
        return <FileText className="text-gray-500 text-xl mr-3" />;
    }
  };

  return (
    <div className="lg:col-span-1">
      {/* Related Resources */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Resources</h2>
          
          <ul className="space-y-3">
            {resources.map((resource) => (
              <li key={resource.id}>
                <a 
                  href={resource.url}
                  className="flex items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getResourceIcon(resource.type)}
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{resource.title}</h3>
                    <p className="text-xs text-muted-foreground">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} {resource.fileSize ? `• ${resource.fileSize}` : ''}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Product Focus */}
      {product && (
        <Card className="mb-6 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Featured Product</h2>
            <h3 className="font-medium text-primary">{product.name}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{product.description}</p>
            
            <h4 className="font-medium text-foreground mt-4 mb-2">Key Ingredients:</h4>
            <ul className="text-sm text-muted-foreground space-y-3">
              {product.ingredients.map((ingredient, index) => {
                const [name, details] = ingredient.includes(' - ') ? ingredient.split(' - ') : [ingredient, ''];
                return (
                  <li key={index} className="border-b border-muted pb-2">
                    <span className="font-semibold text-primary">• {name}</span>
                    {details && (
                      <p className="mt-1 text-xs leading-relaxed">{details}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            
            <Button className="w-full mt-4" variant="outline">
              View Product Details
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Notes Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Notes</h2>
          
          <Textarea 
            className="min-h-[120px]"
            placeholder="Take notes on this lesson..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          
          <div className="flex justify-end mt-3">
            <Button
              variant="outline"
              onClick={handleSaveNote}
              disabled={saveNoteMutation.isPending}
            >
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Feedback Widget */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Lesson Feedback</h2>
          
          <p className="text-muted-foreground text-sm mb-4">How helpful was this lesson?</p>
          
          <div className="flex space-x-1 text-2xl text-muted/50 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${rating >= star ? 'text-yellow-400' : ''} cursor-pointer hover:text-yellow-400 transition`}
              >
                ★
              </button>
            ))}
          </div>
          
          <Textarea
            placeholder="Share your feedback on this lesson..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button
            className="w-full mt-3"
            onClick={handleSubmitFeedback}
            disabled={submitFeedbackMutation.isPending}
          >
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResourceSidebar;
