import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { 
  BookCheck, 
  Award, 
  LogOut, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  BarChart3, 
  ChevronRight, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  AlertCircle,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

interface Quiz {
  id: string;
  topic: string;
  subtopic: string;
  date: string;
  percentage: number;
  total_possible_score: number;
  score: number;
  timeSpent: number;
  negativeMarking: boolean;
  question_type: 'mcq' | 'multiple-correct' | 'true-false';
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswers: number[];
  selectedAnswers: number[];
  isCorrect: boolean;
  partiallyCorrect: boolean;
  score: number;
  explanation: string;
  timeTaken: number;
}

// Helper function to format time in seconds to YY:mm:DD:HH:MM:SS
const formatTime = (seconds: number): string => {
  const years = Math.floor(seconds / (365 * 24 * 3600));
  const remainingSeconds = seconds % (365 * 24 * 3600);
  
  const months = Math.floor(remainingSeconds / (30 * 24 * 3600));
  const remainingSeconds2 = remainingSeconds % (30 * 24 * 3600);
  
  const days = Math.floor(remainingSeconds2 / (24 * 3600));
  const remainingSeconds3 = remainingSeconds2 % (24 * 3600);
  
  const hours = Math.floor(remainingSeconds3 / 3600);
  const remainingSeconds4 = remainingSeconds3 % 3600;
  
  const minutes = Math.floor(remainingSeconds4 / 60);
  const remainingSeconds5 = remainingSeconds4 % 60;
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  const parts = [];
  
  if (years > 0) parts.push(pad(years));
  if (months > 0 || parts.length > 0) parts.push(pad(months));
  if (days > 0 || parts.length > 0) parts.push(pad(days));
  if (hours > 0 || parts.length > 0) parts.push(pad(hours));
  if (minutes > 0 || parts.length > 0) parts.push(pad(minutes));
  parts.push(pad(remainingSeconds5));
  
  return parts.join(':');
};

// Helper function to convert seconds to minutes for charts
const secondsToMinutes = (seconds: number): number => {
  return seconds / 60;
};

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};

// Animation styles
const animationStyles = {
  fadeIn: 'opacity-0 translate-y-4',
  fadeInLeft: 'opacity-0 -translate-x-4',
  fadeInRight: 'opacity-0 translate-x-4',
  fadeInUp: 'opacity-0 -translate-y-4',
  scaleIn: 'opacity-0 scale-95',
  rotateIn: 'opacity-0 rotate-3',
};

const animationTransitions = {
  fadeIn: 'opacity-100 translate-y-0',
  fadeInLeft: 'opacity-100 translate-x-0',
  fadeInRight: 'opacity-100 translate-x-0',
  fadeInUp: 'opacity-100 translate-y-0',
  scaleIn: 'opacity-100 scale-100',
  rotateIn: 'opacity-100 rotate-0',
};

// Animated Chart Component
const AnimatedChart = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('history');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [quizHistory, setQuizHistory] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quiz history when component mounts
  useEffect(() => {
    const fetchQuizHistory = async () => {
      if (!authUser?.id) return;
      
      try {
        const response = await fetch(API_URL + `/quiz/quiz-history?user_id=${authUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz history');
        }
        const data = await response.json();
        setQuizHistory(data.quizzes);
      } catch (error) {
        console.error('Error fetching quiz history:', error);
        toast.error('Failed to load quiz history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizHistory();
  }, [authUser?.id]);

  // Group quizzes by topic
  const quizzesByTopic = quizHistory.reduce((acc, quiz) => {
    if (!acc[quiz.topic]) {
      acc[quiz.topic] = [];
    }
    acc[quiz.topic].push(quiz);
    return acc;
  }, {} as Record<string, Quiz[]>);

  // Stats calculations
  const topicStats = quizHistory.reduce((acc, quiz) => {
    if (!acc[quiz.topic]) {
      acc[quiz.topic] = {
        name: quiz.topic,
        quizzes: 0,
        avgScore: 0,
        totalScore: 0,
        questionTypes: {
          'mcq': 0,
          'multiple-correct': 0,
          'true-false': 0
        }
      };
    }
    acc[quiz.topic].quizzes += 1;
    acc[quiz.topic].totalScore += quiz.score;
    acc[quiz.topic].avgScore = Math.round(acc[quiz.topic].totalScore / acc[quiz.topic].quizzes);
    acc[quiz.topic].questionTypes[quiz.question_type] += 1;
    return acc;
  }, {} as Record<string, { 
    name: string; 
    quizzes: number; 
    avgScore: number; 
    totalScore: number;
    questionTypes: Record<string, number>;
  }>);

  const topicStatsArray = Object.values(topicStats);

  // Calculate overall question type distribution
  const questionTypeStats = quizHistory.reduce((acc, quiz) => {
    if (!acc[quiz.question_type]) {
      acc[quiz.question_type] = 0;
    }
    acc[quiz.question_type] += 1;
    return acc;
  }, {} as Record<string, number>);

  const questionTypeData = Object.entries(questionTypeStats).map(([name, value]) => ({
    name,
    value
  }));

  // Update score distribution data calculation
  const scoreDistribution = quizHistory.reduce((acc, quiz) => {
    const range = Math.floor(quiz.score / 10) * 10;
    const key = `${range}-${range + 9}`;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += 1;
    return acc;
  }, {} as Record<string, number>);

  const scoreDistributionData = Object.entries(scoreDistribution).map(([range, count]) => ({
    range,
    count
  }));

  // Update time analysis data
  const timeAnalysis = quizHistory.map(quiz => ({
    topic: quiz.topic,
    timeInMinutes: secondsToMinutes(quiz.timeSpent),
    score: quiz.percentage
  }));

  // Update performance by question type calculation
  const performanceByQuestionType = quizHistory.reduce((acc, quiz) => {
    if (!acc[quiz.question_type]) {
      acc[quiz.question_type] = {
        totalQuestions: 0,
        correctAnswers: 0,
        time: 0
      };
    }
    acc[quiz.question_type].totalQuestions += quiz.questions.length;
    acc[quiz.question_type].correctAnswers += quiz.questions.reduce((sum, q) => sum + (q.isCorrect ? 1 : 0), 0);
    acc[quiz.question_type].time += quiz.timeSpent;
    return acc;
  }, {} as Record<string, { totalQuestions: number; correctAnswers: number; time: number }>);

  // Update performance by question type data calculation
  const performanceByQuestionTypeData = Object.entries(performanceByQuestionType).map(([type, data]) => ({
    type,
    accuracy: (data.correctAnswers / data.totalQuestions) * 100,
    avgTime: secondsToMinutes(data.time / quizHistory.filter(q => q.question_type === type).length)
  }));

  // Add score progression data
  const scoreProgression = quizHistory
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((quiz, index) => ({
      date: new Date(quiz.date).toLocaleDateString(),
      score: quiz.score,
      topic: quiz.topic,
      cumulativeAvg: quizHistory
        .slice(0, index + 1)
        .reduce((sum, q) => sum + q.score, 0) / (index + 1)
    }));

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      toast.error('Please sign in to view your profile');
    }
  }, [isAuthenticated, navigate]);

  if (!authUser) {
    return null; // Or a loading state
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleQuizDetails = (quiz: any) => {
    setSelectedQuiz(quiz);
    setActiveTab('quiz-details');
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Calculate stats only if quizHistory exists and is not empty
  const averageScore = quizHistory.length > 0 
    ? quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0) / quizHistory.length 
    : null;
  const totalQuizzes = quizHistory.length;
  const totalTopics = new Set(quizHistory.map(quiz => quiz.topic)).size;
  const totalTimeSpent = quizHistory.reduce((sum, quiz) => sum + quiz.timeSpent, 0);

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / User Profile */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={authUser.profilePicture} alt={authUser.name} />
                  <AvatarFallback>{authUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{authUser.name}</CardTitle>
                <CardDescription>{authUser.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">
                    {isLoading ? <Skeleton className="h-6 w-8" /> : totalQuizzes}
                  </div>
                  <div className="text-xs text-gray-500">Quizzes Taken</div>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      averageScore !== null ? `${Math.round(averageScore)}%` : '-'
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Average Percentage</div>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">
                    {isLoading ? <Skeleton className="h-6 w-8" /> : totalTopics}
                  </div>
                  <div className="text-xs text-gray-500">Topics</div>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      formatTime(totalTimeSpent)
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Total Time Spent</div>
                </div>
              </div>
              
              <Separator className="my-4" />

              <Button 
                variant="default" 
                onClick={() => navigate(-1)} 
                className="w-full"
              >
                Return
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full mt-2 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="history" className="flex items-center gap-1">
                <BookCheck className="h-4 w-4" />
                Quiz History
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Statistics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Quiz History</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : !selectedTopic ? (
                  // Show topics list
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(quizzesByTopic).map((topic) => (
                      <Card 
                        key={topic} 
                        className="hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleTopicSelect(topic)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <h3 className="text-xl font-semibold mb-2">{topic}</h3>
                            <p className="text-sm text-gray-500">
                              {quizzesByTopic[topic].length} {quizzesByTopic[topic].length === 1 ? 'quiz' : 'quizzes'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Show quizzes for selected topic
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBackToTopics}
                        className="flex items-center gap-1"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Back to Topics
                      </Button>
                      <h3 className="text-xl font-semibold">{selectedTopic}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {quizzesByTopic[selectedTopic].map((quiz, index) => (
                        <Card 
                          key={quiz.id} 
                          className="hover:shadow-md transition-all cursor-pointer" 
                          onClick={() => handleQuizDetails(quiz)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                  {quiz.subtopic || `General Test ${index + 1}`}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{new Date(quiz.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatTime(quiz.timeSpent)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className={`text-lg font-bold ${quiz.percentage >= 80 ? 'text-green-600' : quiz.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                  {quiz.percentage}%
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span>Details</span>
                                  <ChevronRight className="h-3 w-3" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="statistics">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Quiz Performance</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className={i < 2 ? "lg:col-span-2" : ""}>
                        <CardHeader>
                          <Skeleton className="h-6 w-48 mb-2" />
                          <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="h-60">
                          <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Score Progression */}
                    <AnimatedChart className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Score Progression</CardTitle>
                          <CardDescription>Your learning journey over time</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={scoreProgression}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#8884d8" 
                                name="Quiz Score" 
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="cumulativeAvg" 
                                stroke="#82ca9d" 
                                name="Cumulative Average" 
                                strokeDasharray="5 5"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>

                    {/* Score Distribution */}
                    <AnimatedChart>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Score Distribution</CardTitle>
                          <CardDescription>How your scores are distributed</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={scoreDistributionData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="range" />
                              <YAxis domain={[0, 'dataMax']} allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8884d8" name="Number of Quizzes" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>

                    {/* Question Type Distribution */}
                    <AnimatedChart>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Question Type Distribution</CardTitle>
                          <CardDescription>Types of questions you've attempted</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={questionTypeData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {questionTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>

                    {/* Time vs Score Analysis */}
                    <AnimatedChart>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Time vs Score Analysis</CardTitle>
                          <CardDescription>Relationship between time taken and scores</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" dataKey="timeInMinutes" name="Time (minutes)" />
                              <YAxis type="number" dataKey="score" name="Score" domain={[0, 100]} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Scatter data={timeAnalysis} fill="#8884d8" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>

                    {/* Performance by Question Type */}
                    <AnimatedChart>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance by Question Type</CardTitle>
                          <CardDescription>Accuracy and time taken for different question types</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={performanceByQuestionTypeData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="type" />
                              <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="left" dataKey="accuracy" fill="#8884d8" name="Accuracy (%)" />
                              <Bar yAxisId="right" dataKey="avgTime" fill="#82ca9d" name="Avg Time (minutes)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>

                    {/* Question Types by Topic */}
                    <AnimatedChart className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Question Types by Topic</CardTitle>
                          <CardDescription>Distribution of question types in each topic</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={topicStatsArray}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="questionTypes.mcq" stackId="a" fill="#0088FE" name="MCQ" />
                              <Bar dataKey="questionTypes.multiple-correct" stackId="a" fill="#00C49F" name="Multiple Correct" />
                              <Bar dataKey="questionTypes.true-false" stackId="a" fill="#FFBB28" name="True/False" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>

                    {/* Topic Performance Comparison */}
                    <AnimatedChart className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Topic Performance Comparison</CardTitle>
                          <CardDescription>Detailed performance metrics across topics</CardDescription>
                        </CardHeader>
                        <CardContent className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={topicStatsArray}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                              <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="left" dataKey="avgScore" fill="#8884d8" name="Average Score (%)" />
                              <Bar yAxisId="right" dataKey="quizzes" fill="#82ca9d" name="Number of Quizzes" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </AnimatedChart>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="quiz-details">
              {selectedQuiz && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{selectedQuiz.topic} - {selectedQuiz.subtopic}</h2>
                    <Button variant="outline" onClick={() => setActiveTab('history')}>
                      Back to History
                    </Button>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz Summary</CardTitle>
                      <CardDescription>
                        Taken on {new Date(selectedQuiz.date).toLocaleDateString()} • Time spent: {formatTime(selectedQuiz.timeSpent)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-500" />
                          <div>
                            <div className="text-sm text-gray-500">Percentage</div>
                            <div className="font-bold text-xl">{selectedQuiz.percentage}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookCheck className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-500">Points</div>
                            <div className="font-bold text-xl">{selectedQuiz.score} / {selectedQuiz.total_possible_score}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500">Time</div>
                            <div className="font-bold text-xl">{formatTime(selectedQuiz.timeSpent)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <h3 className="font-semibold text-lg">Questions</h3>
                      
                      <div className="space-y-4">
                        {selectedQuiz.questions.map((q: any, i: number) => {
                          const isSkipped = !q.selectedAnswers || q.selectedAnswers.length === 0;
                          
                          return (
                            <div 
                              key={i} 
                              className={`p-4 rounded-lg border ${
                                q.isCorrect 
                                  ? 'border-green-200 bg-green-50' 
                                  : q.partiallyCorrect 
                                    ? 'border-amber-200 bg-amber-50'
                                    : isSkipped
                                      ? 'border-slate-200 bg-slate-50'
                                      : 'border-red-200 bg-red-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Question {i + 1}</h4>
                                {q.isCorrect ? (
                                  <span className="flex items-center text-green-600 text-sm font-medium">
                                    <Check className="h-4 w-4 mr-1" /> Correct (+{q.score})
                                  </span>
                                ) : isSkipped ? (
                                  <span className="flex items-center text-slate-600 text-sm font-medium">
                                    <HelpCircle className="h-4 w-4 mr-1" /> Not Attempted
                                  </span>
                                ) : q.partiallyCorrect ? (
                                  <span className="flex items-center text-amber-600 text-sm font-medium">
                                    <AlertCircle className="h-4 w-4 mr-1" /> Partially Correct (+{q.score})
                                  </span>
                                ) : (
                                  <span className="flex items-center text-red-600 text-sm font-medium">
                                    <X className="h-4 w-4 mr-1" /> 
                                    Incorrect {selectedQuiz.negativeMarking ? `(${q.score})` : ''}
                                  </span>
                                )}
                              </div>
                              
                              <p className="mt-2">{q.question}</p>
                              
                              <div className="mt-3 space-y-2">
                                {q.options.map((option: string, optIdx: number) => {
                                  const isUserSelected = q.selectedAnswers?.includes(optIdx);
                                  const isCorrectOption = q.correctAnswers.includes(optIdx);
                                  
                                  let className = "pl-2 py-1 border-l-2 ";
                                  
                                  if (isUserSelected && isCorrectOption) {
                                    className += "border-green-500 bg-green-100";
                                  } else if (isUserSelected && !isCorrectOption) {
                                    className += "border-red-500 bg-red-100";
                                  } else if (!isUserSelected && isCorrectOption) {
                                    className += "border-amber-500 bg-amber-100";
                                  } else {
                                    className += "border-transparent";
                                  }
                                  
                                  return (
                                    <div key={optIdx} className={className}>
                                      <div className="flex items-start gap-2">
                                        {selectedQuiz.question_type === 'multiple-correct' ? (
                                          isCorrectOption ? (
                                            <CheckSquare className="h-4 w-4 text-green-600 mt-0.5" />
                                          ) : (
                                            <Square className="h-4 w-4 text-slate-400 mt-0.5" />
                                          )
                                        ) : (
                                          <div className="relative flex h-4 w-4 items-center justify-center">
                                            <div className={`h-3 w-3 rounded-full ${isCorrectOption ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                                          </div>
                                        )}
                                        <span>{option}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {q.explanation && (
                                <div className="mt-4 text-sm bg-white p-3 rounded border border-slate-200">
                                  <span className="font-medium">Explanation:</span> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
