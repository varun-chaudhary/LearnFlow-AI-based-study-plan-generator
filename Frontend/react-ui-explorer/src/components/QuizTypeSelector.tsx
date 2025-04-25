
import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  CircleOff, 
  ListChecks, 
  Clock,
  InfinityIcon,
  Timer,
  Hash,
  MinusCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuizTypeSelectorProps {
  onClose: () => void;
  onSubmit?: (config: QuizConfig) => void;
}

export interface QuizConfig {
  quizType: 'mcq' | 'true-false' | 'multiple-correct';
  timeMode: 'timed' | 'practice';
  duration: number; // in minutes
  questionCount: number;
  timerPerQuestion: boolean;
  negativeMarking: boolean; // New field for negative marking
}

type QuizType = 'mcq' | 'true-false' | 'multiple-correct';
type TimeMode = 'timed' | 'practice';

const QuizTypeSelector: React.FC<QuizTypeSelectorProps> = ({ onClose, onSubmit }) => {
  const [selectedType, setSelectedType] = useState<QuizType>('mcq');
  const [step, setStep] = useState<'quiz-type' | 'time-selection' | 'questions-count'>('quiz-type');
  const [timeMode, setTimeMode] = useState<TimeMode>('timed');
  const [duration, setDuration] = useState<number>(10); // Default 10 minutes
  const [questionCount, setQuestionCount] = useState<number>(10); // Default 10 questions
  const [timerPerQuestion, setTimerPerQuestion] = useState<boolean>(false);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false); // Default no negative marking
  const [durationInput, setDurationInput] = useState<string>("10");
  const [questionCountInput, setQuestionCountInput] = useState<string>("10");

  // Initialize input fields with current values
  useEffect(() => {
    setDurationInput(duration.toString());
    setQuestionCountInput(questionCount.toString());
  }, [duration, questionCount]);

  const handleNextStep = () => {
    // Validate inputs before proceeding
    if (step === 'questions-count') {
      if (!questionCountInput || parseInt(questionCountInput) < 1) {
        toast.error("Please enter a valid number of questions (minimum 1)");
        return;
      }
      
      // Skip time selection for practice mode
      if (timeMode === 'practice') {
        handleGenerateQuiz();
      } else {
        setStep('time-selection');
      }
    } else if (step === 'time-selection') {
      if (!durationInput || parseInt(durationInput) < 1) {
        toast.error("Please enter a valid duration (minimum 1 minute)");
        return;
      }
      handleGenerateQuiz();
    } else if (step === 'quiz-type') {
      setStep('questions-count');
    }
  };

  const handleBackStep = () => {
    if (step === 'time-selection') {
      setStep('questions-count');
    } else if (step === 'questions-count') {
      setStep('quiz-type');
    }
  };

  const handleGenerateQuiz = () => {
    if (!durationInput || parseInt(durationInput) < 1) {
      toast.error("Please enter a valid duration (minimum 1 minute)");
      return;
    }

    // Ensure we have valid numbers
    const validQuestionCount = questionCountInput ? parseInt(questionCountInput) : 10;
    const validDuration = durationInput ? parseInt(durationInput) : 10;
    
    const quizConfig: QuizConfig = {
      quizType: selectedType,
      timeMode,
      duration: validDuration,
      questionCount: validQuestionCount,
      timerPerQuestion,
      negativeMarking
    };
    
    if (onSubmit) {
      onSubmit(quizConfig);
    } else {
      const quizTypeName = getQuizTypeName(selectedType);
      let timeConfig;
      
      if (timeMode === 'practice') {
        timeConfig = 'Practice Mode (Unlimited Time)';
      } else {
        timeConfig = timerPerQuestion 
          ? `Timer per question, ${validDuration} Minute${validDuration !== 1 ? 's' : ''} total` 
          : `${validDuration} Minute${validDuration !== 1 ? 's' : ''} total`;
      }
      
      const markingInfo = negativeMarking ? ' with negative marking' : '';
      
      toast.success(`Generating ${quizTypeName} quiz${markingInfo} with ${validQuestionCount} questions - ${timeConfig}`);
      onClose();
    }
  };

  const getQuizTypeName = (type: QuizType): string => {
    switch (type) {
      case 'mcq':
        return 'Multiple Choice';
      case 'true-false':
        return 'True/False';
      case 'multiple-correct':
        return 'Multiple Correct Answers';
      default:
        return '';
    }
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuestionCountInput(value);

    if (value === '') {
      return; // Allow empty input for better UX
    }

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      // Only update the actual count if it's within range
      if (numValue >= 1 && numValue <= 50) {
        setQuestionCount(numValue);
      }
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDurationInput(value);

    if (value === '') {
      return; // Allow empty input for better UX
    }

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      // Only update the actual duration if it's within range
      if (numValue >= 1 && numValue <= 60) {
        setDuration(numValue);
      }
    }
  };

  return (
    <div className="py-4">
      {step === 'quiz-type' ? (
        <>
          <RadioGroup
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as QuizType)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
              <RadioGroupItem value="mcq" id="mcq" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center">
                  <Label htmlFor="mcq" className="font-medium text-base cursor-pointer">Multiple Choice Questions</Label>
                  <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Questions with 4 options where only one answer is correct
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
              <RadioGroupItem value="true-false" id="true-false" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center">
                  <Label htmlFor="true-false" className="font-medium text-base cursor-pointer">True/False Questions</Label>
                  <CircleOff className="ml-2 h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Questions where the answer is either true or false
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
              <RadioGroupItem value="multiple-correct" id="multiple-correct" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center">
                  <Label htmlFor="multiple-correct" className="font-medium text-base cursor-pointer">Multiple Correct Answers</Label>
                  <ListChecks className="ml-2 h-4 w-4 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Questions with 4 options where any number of answers can be correct
                </p>
              </div>
            </div>
          </RadioGroup>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleNextStep}>
              Next
            </Button>
          </div>
        </>
      ) : step === 'questions-count' ? (
        <>
          <h3 className="text-lg font-medium mb-4">Number of Questions</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center border p-4 rounded-md">
              <Hash className="h-5 w-5 text-muted-foreground mr-3" />
              <div className="flex-1">
                <Label htmlFor="question-count" className="font-medium text-base mb-2 block">Question Count</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="question-count"
                    type="number"
                    min="1"
                    max="50"
                    value={questionCountInput}
                    onChange={handleQuestionCountChange}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">Questions</span>
                </div>
              </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Label htmlFor="negative-marking" className="font-medium text-base cursor-pointer">Enable Negative Marking</Label>
                    <MinusCircle className="ml-2 h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deduct points for incorrect answers
                  </p>
                </div>
                <Switch
                  id="negative-marking"
                  checked={negativeMarking}
                  onCheckedChange={setNegativeMarking}
                />
              </div>
              {negativeMarking && (
                <div className="mt-3 text-xs text-muted-foreground border-t pt-2">
                  <p className="mb-1">• MCQ/True-False: +4 points for correct, -1 for incorrect</p>
                  <p>• Multiple-correct: +1 point per correct choice, +4 for all correct choices, -2 if any wrong option selected</p>
                </div>
              )}
            </div>
            
            <RadioGroup
              value={timeMode}
              onValueChange={(value) => setTimeMode(value as TimeMode)}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
                <RadioGroupItem value="timed" id="timed" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center">
                    <Label htmlFor="timed" className="font-medium text-base cursor-pointer">Timed Quiz</Label>
                    <Clock className="ml-2 h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set a time limit for the entire quiz
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0 border p-4 rounded-md hover:bg-muted cursor-pointer">
                <RadioGroupItem value="practice" id="practice" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center">
                    <Label htmlFor="practice" className="font-medium text-base cursor-pointer">Practice Mode</Label>
                    <InfinityIcon className="ml-2 h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Take your time with unlimited duration
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between gap-3 mt-6">
            <Button variant="outline" onClick={handleBackStep}>
              Back
            </Button>
            <Button onClick={handleNextStep}>
              {timeMode === 'practice' ? 'Generate Quiz' : 'Next'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium mb-4">Time Configuration</h3>
          
          <div className="space-y-6 mb-6">
            <div className="border p-4 rounded-md">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <Label className="font-medium text-base">Total Duration</Label>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={durationInput}
                    onChange={handleDurationChange}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">Minutes</span>
                </div>
              </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <div className="flex items-center space-x-3">
                <div className="flex items-center h-4">
                  <input
                    type="checkbox"
                    id="timer-per-question"
                    checked={timerPerQuestion}
                    onChange={() => setTimerPerQuestion(!timerPerQuestion)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <Label htmlFor="timer-per-question" className="font-medium text-base cursor-pointer">Timer Per Question</Label>
                    <Timer className="ml-2 h-4 w-4 text-rose-500" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Question will auto-submit when its time limit is reached
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-6">
            <Button variant="outline" onClick={handleBackStep}>
              Back
            </Button>
            <Button onClick={handleGenerateQuiz}>
              Generate Quiz
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizTypeSelector;
