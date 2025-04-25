import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Timer,
  CheckSquare,
  Square,
  MinusCircle,
  HelpCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getQuizByTopic, type QuizQuestion, type QuizData } from '@/data/getQuizData';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/useAuth';
const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

interface QuizConfig {
  quizType: 'mcq' | 'true-false' | 'multiple-correct';
  timeMode: 'timed' | 'practice';
  duration: number; // in minutes
  questionCount: number;
  timerPerQuestion: boolean;
  negativeMarking: boolean;
}

const QuizPage: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth();
  
  const defaultConfig: QuizConfig = {
    quizType: 'mcq',
    timeMode: 'timed',
    duration: 10,
    questionCount: 10,
    timerPerQuestion: false,
    negativeMarking: false
  };
  
  const quizConfig: QuizConfig = location.state?.quizConfig || defaultConfig;
  const subTopic: string = location.state?.subTopic || '';
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizEnded, setQuizEnded] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(quizConfig.duration * 60); // in seconds
  const [questionTimers, setQuestionTimers] = useState<Record<number, number>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<number, number>>({});
  const [questionTotalTimes, setQuestionTotalTimes] = useState<Record<number, number>>({});
  const [lockedQuestions, setLockedQuestions] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [questionResults, setQuestionResults] = useState<Record<number, {
    attempted: boolean;
    isCorrect: boolean;
    partiallyCorrect?: boolean;
    score: number;
  }>>({});

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeButton = buttonRefs.current[activeQuestionIndex];
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeQuestionIndex]);
  
  const timePerQuestion = quizConfig.timerPerQuestion 
    ? Math.floor((quizConfig.duration * 60) / quizConfig.questionCount) 
    : 0;
  
  useEffect(() => {
      if (topic) {
        getQuizByTopic(topic, quizConfig.quizType, quizConfig.questionCount, subTopic).then(quiz => {
          // Ensure each question has the correct type and structure
          const typedQuiz = {
            ...quiz,
            questions: quiz.questions.map(q => ({
              ...q,
              type: quizConfig.quizType,
              correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : [],
              options: Array.isArray(q.options) ? q.options : []
            }))
          };
          setQuizData(typedQuiz);
          
          const initialAnswers: Record<string, number[]> = {};
          quiz.questions.forEach((q, index) => {
            initialAnswers[index] = [];
          });
          setSelectedAnswers(initialAnswers);
          
        }).catch(error => {
          toast.error(error.message || 'Failed to load quiz data');
          navigate(`/topic/${topic}`)
        });
      }
    }, [topic, quizConfig]);
  
  useEffect(() => {
    if (quizStarted && !quizEnded) {
      // Record start time when question becomes visible
      setQuestionStartTimes(prev => ({
        ...prev,
        [activeQuestionIndex]: Date.now()
      }));
    }
  }, [activeQuestionIndex, quizStarted, quizEnded]);
  
  useEffect(() => {
    if (!quizStarted || quizEnded) return;

    // Cleanup function to calculate time spent when question leaves screen
    return () => {
      const startTime = questionStartTimes[activeQuestionIndex];
      if (startTime) {
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000); // Convert to seconds
        
        setQuestionTotalTimes(prev => ({
          ...prev,
          [activeQuestionIndex]: (prev[activeQuestionIndex] || 0) + timeSpent
        }));
      }
    };
  }, [activeQuestionIndex, quizStarted, quizEnded, questionStartTimes]);
  
  useEffect(() => {
    if (!quizStarted || quizEnded || quizConfig.timeMode === 'practice') return;
    
    const timerId = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          endQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [quizStarted, quizEnded, quizConfig.timeMode]);
  
  useEffect(() => {
    if (!quizStarted || quizEnded || !quizConfig.timerPerQuestion) return;
    
    const questionTimerId = setInterval(() => {
      setQuestionTimers(prevTimers => {
        const currentQuestionTime = prevTimers[activeQuestionIndex] || 0;
        
        if (currentQuestionTime <= 1) {
          clearInterval(questionTimerId);
          if (!lockedQuestions.includes(activeQuestionIndex)) {
            setLockedQuestions(prev => [...prev, activeQuestionIndex]);
          }
          toast.error("Time's up for this question!");
          
          goToNextAvailableQuestion();
          
          return prevTimers;
        }
        
        return {
          ...prevTimers,
          [activeQuestionIndex]: currentQuestionTime - 1
        };
      });
    }, 1000);
    
    return () => clearInterval(questionTimerId);
  }, [quizStarted, quizEnded, quizConfig.timerPerQuestion, activeQuestionIndex]);
  
  const startQuiz = () => {
    setQuizStarted(true);
    if (quizConfig.timeMode === 'timed') {
      setTimeRemaining(quizConfig.duration * 60);
    }
    if (quizConfig.timerPerQuestion && quizData) {
      const initialTimers: Record<number, number> = {};
      quizData.questions.forEach((_, index) => {
        initialTimers[index] = timePerQuestion;
      });
      setQuestionTimers(initialTimers);
    }
  };
  
  const calculateQuestionScore = (question: QuizQuestion, userAnswers: number[]): { score: number, isCorrect: boolean, partiallyCorrect?: boolean } => {
    if (userAnswers.length === 0) {
      return { score: 0, isCorrect: false };
    }
    
    if (question.type === 'mcq' || question.type === 'true-false') {
      const isCorrect = userAnswers.length === 1 && userAnswers[0] === question.correct_answers[0];
      
      if (isCorrect) {
        return { score: 4, isCorrect: true };
      } else if (quizConfig.negativeMarking) {
        return { score: -1, isCorrect: false };
      } else {
        return { score: 0, isCorrect: false };
      }
    } else if (question.type === 'multiple-correct') {
      const correctAnswersSelected = userAnswers.filter(answer => 
        question.correct_answers.includes(answer)
      ).length;
      
      const incorrectAnswersSelected = userAnswers.filter(answer => 
        !question.correct_answers.includes(answer)
      ).length;
      
      // If any incorrect option is selected, score is -2
      if (incorrectAnswersSelected > 0) {
        return { score: -2, isCorrect: false };
      }
      
      // If all correct answers are selected, score is +4
      if (correctAnswersSelected === question.correct_answers.length) {
        return { score: 4, isCorrect: true };
      }
      
      // Partial marking: +1 for each correct answer selected
      if (correctAnswersSelected > 0) {
        return { 
          score: correctAnswersSelected, 
          isCorrect: false,
          partiallyCorrect: true
        };
      }
      
      return { score: 0, isCorrect: false };
    }
    
    return { score: 0, isCorrect: false };
  };
  
  const endQuiz = useCallback(() => {
    setQuizEnded(true);
    
    if (!quizData) return;
    
    // Calculate final time for current question
    const startTime = questionStartTimes[activeQuestionIndex];
    if (startTime) {
      const endTime = Date.now();
      const timeSpent = Math.floor((endTime - startTime) / 1000);
      
      setQuestionTotalTimes(prev => ({
        ...prev,
        [activeQuestionIndex]: (prev[activeQuestionIndex] || 0) + timeSpent
      }));
    }
    
    let totalScore = 0;
    const results: Record<number, {
      attempted: boolean;
      isCorrect: boolean;
      partiallyCorrect?: boolean;
      score: number;
    }> = {};
    
    quizData.questions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      const attempted = userAnswers.length > 0;
      const result = calculateQuestionScore(question, userAnswers);
      
      results[index] = {
        attempted,
        isCorrect: result.isCorrect,
        partiallyCorrect: result.partiallyCorrect,
        score: result.score
      };
      
      totalScore += result.score;
    });
    
    const maxPossibleScore = quizData.questions.length * 4;
    const scorePercentage = Math.round((totalScore / maxPossibleScore) * 100);
    
    setScore(scorePercentage);
    setQuestionResults(results);
    
    // Calculate statistics for the API call
    const correctAttempts = Object.values(results).filter(r => r.isCorrect).length;
    const incorrectAttempts = Object.values(results).filter(r => !r.isCorrect && r.attempted && !r.partiallyCorrect).length;
    const partialAttempts = Object.values(results).filter(r => r.partiallyCorrect).length;
    const unattempted = Object.values(results).filter(r => !r.attempted).length;
    
    // Prepare question attempts data - include all questions
    const questionAttempts = quizData.questions.map((question, index) => {
      // Get the total accumulated time for this question
      const timeTaken = questionTotalTimes[index] || 0;
      
      // Get the attempted options, defaulting to empty array if not attempted
      const attemptedOptions = selectedAnswers[index] || [];
      
      return {
        question_id: question.id,
        time_taken: timeTaken,
        attempted_options: attemptedOptions
      };
    });
    
    // Call the save quiz attempt API
    fetch(API_URL + '/quiz/save-quiz-attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user?.user?.id,
        total_time_taken: quizConfig.duration * 60 - timeRemaining,
        score: totalScore,
        correct_attempts: correctAttempts,
        incorrect_attempts: incorrectAttempts,
        partial_attempts: partialAttempts,
        unattempted: unattempted,
        is_negative_marking: quizConfig.negativeMarking,
        question_attempts: questionAttempts,
        topic: quizData.topic,
        subtopic: subTopic,
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        toast.success('Quiz attempt saved successfully');
      } else {
        toast.error('Failed to save quiz attempt');
      }
    })
    .catch(error => {
      console.error('Error saving quiz attempt:', error);
      toast.error('Failed to save quiz attempt');
    });
    
    toast.success(`Quiz completed! Your score: ${scorePercentage}%`);
  }, [quizData, selectedAnswers, quizConfig.negativeMarking, quizConfig.duration, timeRemaining, questionStartTimes, questionTotalTimes, activeQuestionIndex, user]);
  
  const handleAnswerSelect = (questionIndex: number, optionIndex: number, multiple: boolean = false) => {
    setSelectedAnswers(prev => {
      const current = prev[questionIndex] || [];
      let newAnswers;
      
      if (multiple) {
        if (current.includes(optionIndex)) {
          newAnswers = current.filter(idx => idx !== optionIndex);
        } else {
          newAnswers = [...current, optionIndex];
        }
      } else {
        newAnswers = [optionIndex];
      }
      
      return { ...prev, [questionIndex]: newAnswers };
    });
  };
  
  const clearAnswers = (questionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: []
    }));
    toast.info("Selection cleared");
  };
  
  const goToQuestionIndex = (index: number) => {
    if (index < 0 || !quizData || index >= quizData.questions.length) return;
    
    if (lockedQuestions.includes(index)) {
      toast.error("This question is locked because time ran out");
      return;
    }
    
    setActiveQuestionIndex(index);
  };
  
  const goToNextAvailableQuestion = useCallback(() => {
    if (!quizData) return;
    
    let nextIndex = activeQuestionIndex + 1;
    
    while (nextIndex < quizData.questions.length && lockedQuestions.includes(nextIndex)) {
      nextIndex++;
    }
    
    if (nextIndex < quizData.questions.length) {
      setActiveQuestionIndex(nextIndex);
    } else {
      nextIndex = activeQuestionIndex - 1;
      while (nextIndex >= 0 && lockedQuestions.includes(nextIndex)) {
        nextIndex--;
      }
      
      if (nextIndex >= 0) {
        setActiveQuestionIndex(nextIndex);
      } else {
        endQuiz();
      }
    }
  }, [activeQuestionIndex, quizData, lockedQuestions, endQuiz]);
  
  const goToNextQuestion = useCallback(() => {
    if (!quizData) return;
    
    if (activeQuestionIndex < quizData.questions.length - 1) {
      goToQuestionIndex(activeQuestionIndex + 1);
    } else {
      endQuiz();
    }
  }, [activeQuestionIndex, quizData, endQuiz]);
  
  const goToPreviousQuestion = () => {
    if (quizConfig.timerPerQuestion) {
      toast.error("Cannot navigate back when timer per question is enabled");
      return;
    }
    
    if (activeQuestionIndex > 0) {
      goToQuestionIndex(activeQuestionIndex - 1);
    }
  };
  
  const handleSubmitQuiz = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      endQuiz();
      setIsSubmitting(false);
    }, 1000);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const calculateProgress = (): number => {
    if (!quizData || quizData.questions.length === 0) return 0;
    return ((activeQuestionIndex + 1) / quizData.questions.length) * 100;
  };
  
  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading quiz...</span>
      </div>
    );
  }
  
  const currentQuestion = quizData.questions[activeQuestionIndex];
  const isMultipleCorrect = quizConfig.quizType === 'multiple-correct';
  const userAnswers = selectedAnswers[activeQuestionIndex] || [];
  const currentQuestionRemainingTime = questionTimers[activeQuestionIndex] || timePerQuestion;
  
  if (!quizStarted) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {quizData.topic} Quiz
              {subTopic && <span className="text-sm text-muted-foreground"> - {subTopic}</span>}
            </CardTitle>
            <CardDescription>
              {quizConfig.quizType === 'mcq' ? 'Multiple Choice Questions' : 
                quizConfig.quizType === 'true-false' ? 'True/False Questions' : 
                'Multiple Correct Answers Questions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="space-y-4 w-full">
              <p className="text-center">You will have {quizConfig.timeMode === 'practice' ? 'unlimited time' : `${quizConfig.duration} minutes`} to complete {quizData.questions.length} questions.</p>
              
              {quizConfig.timerPerQuestion && (
                <p className="text-center">Each question has a time limit of {formatTime(timePerQuestion)} seconds.</p>
              )}
              
              {quizConfig.negativeMarking && (
                <div className="flex items-center justify-center gap-2 text-center text-rose-600 font-medium mb-2">
                  <MinusCircle className="h-4 w-4" />
                  <span>Negative marking is enabled</span>
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                <div className="flex flex-col items-center">
                  <h4 className="font-semibold text-center">Quiz Instructions</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-center">
                    <li>Read each question carefully before answering.</li>
                    <li>{isMultipleCorrect ? 'Some questions may have multiple correct answers.' : 'Each question has exactly one correct answer.'}</li>
                    <li>You can clear your selection for any question.</li>
                    <li>You can navigate between questions using the question number buttons.</li>
                    {quizConfig.timerPerQuestion && <li>Each question has its own timer. If time runs out for a question, it will be locked and you cannot return to it.</li>}
                    {quizConfig.timeMode === 'timed' && <li>The quiz will automatically end when the time is up.</li>}
                    
                    {quizConfig.negativeMarking && (
                      <>
                        <li className="font-medium text-rose-700">Negative marking is enabled:</li>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          <li>MCQ/True-False: +4 points for correct, -1 for incorrect</li>
                          <li>Multiple-correct: +1 per correct choice, +4 for all correct, -2 if any wrong option selected</li>
                        </ul>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startQuiz} className="w-full">Start Quiz</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (quizEnded) {
    return <QuizResults 
      topic={quizData.topic}
      quizData={quizData}
      selectedAnswers={selectedAnswers}
      score={score}
      onReturnToTopic={() => navigate(`/topic/${topic}`)}
      questionResults={questionResults}
      negativeMarking={quizConfig.negativeMarking}
    />;
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{quizData.topic} Quiz</CardTitle>
            {quizConfig.timeMode === 'timed' && (
              <div className="flex items-center gap-2 text-amber-600 font-medium">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="flex justify-between text-sm mb-1">
              <span>Question {activeQuestionIndex + 1} of {quizData.questions.length}</span>
              {quizConfig.timerPerQuestion && (
                <div className="flex items-center gap-1 text-rose-600">
                  <Timer className="h-4 w-4" />
                  <span>{formatTime(currentQuestionRemainingTime)}</span>
                </div>
              )}
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <ScrollArea className="w-full h-16 overflow-x-auto whitespace-nowrap">
            <div className="flex p-4 gap-2 min-w-full">
              {quizData.questions.map((_, index) => {
                const isActive = index === activeQuestionIndex;
                const isAnswered = (selectedAnswers[index] || []).length > 0;
                const isLocked = lockedQuestions.includes(index);
                
                return (
                  <Button
                    key={index}
                    size="sm"
                    ref={(el) => (buttonRefs.current[index] = el)}
                    variant={isActive ? "default" : isAnswered ? "success" : "secondary"}
                    className={`w-10 h-10 flex-shrink-0 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={() => goToQuestionIndex(index)}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      index + 1
                    )}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="text-lg font-medium">{currentQuestion.question}</div>
          
          {isMultipleCorrect ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`option-${idx}`}
                    checked={userAnswers.includes(idx)}
                    onCheckedChange={() => handleAnswerSelect(activeQuestionIndex, idx, true)}
                  />
                  <Label 
                    htmlFor={`option-${idx}`}
                    className="cursor-pointer flex-1 p-3 rounded-md hover:bg-accent"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup 
              value={userAnswers.length ? userAnswers[0].toString() : undefined}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={idx.toString()} 
                    id={`option-${idx}`} 
                    checked={userAnswers.includes(idx)}
                    onClick={() => handleAnswerSelect(activeQuestionIndex, idx)}
                  />
                  <Label 
                    htmlFor={`option-${idx}`}
                    className="cursor-pointer flex-1 p-3 rounded-md hover:bg-accent"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => clearAnswers(activeQuestionIndex)}
              disabled={userAnswers.length === 0}
            >
              <X className="mr-1 h-3 w-3" /> Clear Selection
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={activeQuestionIndex === 0 || quizConfig.timerPerQuestion}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
          </div>
          <div className="flex gap-2">
            {activeQuestionIndex === quizData.questions.length - 1 && (
              <Button 
                onClick={handleSubmitQuiz} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Finish Quiz
                  </>
                )}
              </Button>
            )}
            
            {activeQuestionIndex < quizData.questions.length - 1 && (
              <Button onClick={goToNextQuestion}>
                Next <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

interface QuizResultsProps {
  topic: string;
  quizData: QuizData;
  selectedAnswers: Record<string, number[]>;
  score: number;
  onReturnToTopic: () => void;
  questionResults: Record<number, {
    attempted: boolean;
    isCorrect: boolean;
    partiallyCorrect?: boolean;
    score: number;
  }>;
  negativeMarking: boolean;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
  quizData, 
  selectedAnswers, 
  topic,
  score,
  onReturnToTopic,
  questionResults,
  negativeMarking
}) => {
  const [showExplanations, setShowExplanations] = useState<boolean>(true);
  
  const totalPoints = Object.values(questionResults).reduce((sum, result) => sum + result.score, 0);
  const maxPossiblePoints = quizData.questions.length * 4;
  const scorePercentage = Math.round((totalPoints / maxPossiblePoints) * 100);

  const navigate = useNavigate();
  
  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="w-full mb-4">
        <Button 
          variant="default" 
          onClick={onReturnToTopic}
          className="w-full"
        >
          Return to Topic
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
          <CardDescription>
            You've completed the {quizData.topic} quiz
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
            <div className="text-4xl font-bold mb-2 text-center">
              <span className={getScoreColor(scorePercentage)}>
                {totalPoints} / {maxPossiblePoints} points
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {scorePercentage >= 80 ? 'Excellent work!' : 
                scorePercentage >= 60 ? 'Good job!' : 
                'Keep practicing!'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ({scorePercentage}%)
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Review Questions</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
            >
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </Button>
          </div>
          
          <div className="space-y-8">
            {quizData.questions.map((question, idx) => {
              const userAnswers = selectedAnswers[idx] || [];
              const result = questionResults[idx] || { attempted: false, isCorrect: false, score: 0 };
              const isSkipped = !result.attempted;
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border ${result.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : result.partiallyCorrect 
                      ? 'border-amber-200 bg-amber-50'
                      : isSkipped
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-red-200 bg-red-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Question {idx + 1}</h4>
                    {result.isCorrect ? (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <Check className="h-4 w-4 mr-1" /> Correct (+{result.score})
                      </span>
                    ) : isSkipped ? (
                      <span className="flex items-center text-slate-600 text-sm font-medium">
                        <HelpCircle className="h-4 w-4 mr-1" /> Not Attempted
                      </span>
                    ) : result.partiallyCorrect ? (
                      <span className="flex items-center text-amber-600 text-sm font-medium">
                        <AlertCircle className="h-4 w-4 mr-1" /> Partially Correct (+{result.score})
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm font-medium">
                        <X className="h-4 w-4 mr-1" /> 
                        Incorrect {result.score < 0 ? `(${result.score})` : ''}
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-2">{question.question}</p>
                  
                  <div className="mt-3 space-y-2">
                    {question.options.map((option, optIdx) => {
                      const isUserSelected = userAnswers.includes(optIdx);
                      const isCorrectOption = (question.correct_answers || []).includes(optIdx);
                      
                      let className = "pl-2 py-1 border-l-2 ";
                      let icon = null;
                      let status = '';
                      
                      if (question.type === 'multiple-correct') {
                        if (isCorrectOption) {
                          if (isUserSelected) {
                            icon = <CheckSquare className="h-4 w-4 text-green-600 mt-0.5" />;
                            className += "border-green-500 bg-green-100";
                            status = 'Correctly selected';
                          } else {
                            icon = <Square className="h-4 w-4 text-amber-600 mt-0.5" />;
                            className += "border-amber-500 bg-amber-100";
                            status = 'Missed correct answer';
                          }
                        } else {
                          if (isUserSelected) {
                            icon = <CheckSquare className="h-4 w-4 text-red-600 mt-0.5" />;
                            className += "border-red-500 bg-red-100";
                            status = 'Incorrectly selected';
                          } else {
                            icon = <Square className="h-4 w-4 text-slate-400 mt-0.5" />;
                            className += "border-transparent";
                          }
                        }
                      } else {
                        if (isCorrectOption) {
                          if (isUserSelected) {
                            icon = (
                              <div className="relative flex h-4 w-4 items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              </div>
                            );
                            className += "border-green-500 bg-green-100";
                            status = 'Correct answer';
                          } else {
                            icon = (
                              <div className="relative flex h-4 w-4 items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                              </div>
                            );
                            className += "border-amber-500 bg-amber-100";
                            status = 'Missed correct answer';
                          }
                        } else {
                          if (isUserSelected) {
                            icon = (
                              <div className="relative flex h-4 w-4 items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                              </div>
                            );
                            className += "border-red-500 bg-red-100";
                            status = 'Incorrect answer';
                          } else {
                            icon = (
                              <div className="relative flex h-4 w-4 items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                              </div>
                            );
                            className += "border-transparent";
                          }
                        }
                      }
                      
                      return (
                        <div key={`${idx}-option-${optIdx}`} className={className}>
                          <div className="flex items-start gap-2">
                            {icon}
                            <div className="flex-1">
                              <span>{option}</span>
                              {status && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({status})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {result.partiallyCorrect && (
                    <div className="mt-2 text-sm text-amber-600">
                      Partial marks awarded: +{result.score} for selecting {result.score} correct option{result.score > 1 ? 's' : ''}
                    </div>
                  )}
                  
                  {!result.isCorrect && !result.partiallyCorrect && result.score < 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      Negative marking: {result.score} points for selecting incorrect option{result.score < -1 ? 's' : ''}
                    </div>
                  )}
                  
                  {showExplanations && question.explanation && (
                    <div className="mt-4 text-sm bg-white p-3 rounded border border-slate-200">
                      <span className="font-medium">Explanation:</span> {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={onReturnToTopic} className="w-full">
            Return to Topic
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPage;
