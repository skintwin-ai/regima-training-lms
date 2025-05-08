import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Step } from "@/lib/types";

interface StepByStepGuideProps {
  steps: Step[];
  note?: string;
}

export function StepByStepGuide({ steps, note }: StepByStepGuideProps) {
  return (
    <div className="space-y-4 mb-6">
      {steps.map((step) => (
        <div key={step.id} className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex-shrink-0 flex items-center justify-center font-semibold">
            {step.order}
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-foreground">{step.title}</h4>
            <p className="text-muted-foreground mt-1">{step.description}</p>
          </div>
        </div>
      ))}
      
      {note && (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 text-yellow-800 dark:text-yellow-200 mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Note</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {note}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default StepByStepGuide;
