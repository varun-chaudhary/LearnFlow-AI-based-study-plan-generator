import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, ExternalLink, BookCheck, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QuizTypeSelector from './QuizTypeSelector';
import ResourcesDialog from './ResourcesDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

interface SubTopic {
  name: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  whyItMatters: string;
  commonMistakes: string[];
}

interface SubTopicsSectionProps {
  subTopics: Array<SubTopic>;
  topicName: string;
}

const SubtopicsSection: React.FC<SubTopicsSectionProps> = ({ subTopics, topicName }) => {
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SubTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingDocumentation, setLoadingDocumentation] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenDetails = (topic: SubTopic) => {
    setSelectedTopic(topic);
  };
  
  const handleGenerateQuiz = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowQuizDialog(true);
  };

  const handleQuizConfigSubmit = (quizConfig: any, subTopic: string) => {
    setShowQuizDialog(false);
    setIsLoading(true);
    
    // Clear existing content by navigating to a temporary route
    
    // Extract the topic from the URL
    const topicMatch = location.pathname.match(/\/topic\/(.+)/);
    if (topicMatch && topicMatch[1]) {
      const topic = decodeURIComponent(topicMatch[1]);
      
      // Navigate to the quiz page with the quiz configuration after a short delay
      setTimeout(() => {
        navigate(`/quiz/${topic}`, { state: { quizConfig, subTopic } });
        setIsLoading(false);
      }, 100);
    }
  };

  const handleGoToAuth = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  const handleGenerateResources = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowResourcesDialog(true);
    
    // Reset states
    setVideos([]);
    setArticles([]);
    setDocumentation([]);
    setLoadingVideos(true);
    setLoadingArticles(true);
    setLoadingDocumentation(true);

    const requestBody = {
      topic_name: topicName,
      subtopic_name: selectedTopic?.name
    };

    // Load videos
    fetch(API_URL + '/gemini-search/generate-topic-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      if (data.videos) setVideos(data.videos);
    })
    .catch(error => {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
    })
    .finally(() => {
      setLoadingVideos(false);
    });

    // Load articles
    fetch(API_URL + '/gemini-search/generate-topic-articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      if (data.articles) setArticles(data.articles);
    })
    .catch(error => {
      console.error('Error loading articles:', error);
      toast.error('Failed to load articles');
    })
    .finally(() => {
      setLoadingArticles(false);
    });

    // Load documentation
    fetch(API_URL + '/gemini-search/generate-topic-documentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
      if (data.documentation) setDocumentation(data.documentation);
    })
    .catch(error => {
      console.error('Error loading documentation:', error);
      toast.error('Failed to load documentation');
    })
    .finally(() => {
      setLoadingDocumentation(false);
    });
  };

  return (
    <section id="subtopics" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          {topicName} <span className="text-react-primary">Topics</span> to Master
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore these key {topicName} concepts to build a strong foundation and advance your skills
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subTopics.map((topic, index) => (
            <Card key={index} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{topic.name}</CardTitle>
                  <Badge className={getDifficultyColor(topic.difficulty)}>
                    {topic.difficulty}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{topic.timeToComplete}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-3">{topic.description}</p>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleOpenDetails(topic as SubTopic)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  {selectedTopic && (
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="bg-white dark:bg-gray-800 z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 max-w-[calc(100%-3rem)]">
                            <DialogTitle className="text-lg">{selectedTopic.name}</DialogTitle>
                            <Badge className={getDifficultyColor(selectedTopic.difficulty)}>
                              {selectedTopic.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{selectedTopic.timeToComplete}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div>
                          <p className="text-gray-700">{selectedTopic.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-1">Why It Matters</h4>
                          <p className="text-gray-700">{selectedTopic.whyItMatters}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-1">Common Mistakes</h4>
                          <ul className="space-y-2">
                            {selectedTopic.commonMistakes.map((mistake, i) => (
                              <li key={i} className="flex gap-2 items-start">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                                <span className="text-gray-700">{mistake}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-6">
                          <Button 
                            className="w-full bg-react-primary text-react-secondary hover:bg-react-primary/90"
                            onClick={handleGenerateResources}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Generate Resources
                          </Button>
                          <Button 
                            className="w-full bg-react-dark text-react-light hover:bg-react-dark/90"
                            onClick={handleGenerateQuiz}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <BookCheck className="h-4 w-4 mr-2" />
                            )}
                            {isLoading ? "Loading..." : "Generate Quiz"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Resources Dialog */}
      <ResourcesDialog
        isOpen={showResourcesDialog}
        onOpenChange={setShowResourcesDialog}
        topicName={topicName}
        subtopicName={selectedTopic?.name}
        videos={videos}
        articles={articles}
        documentation={documentation}
        loadingVideos={loadingVideos}
        loadingArticles={loadingArticles}
        loadingDocumentation={loadingDocumentation}
      />

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="relative z-20">
            <div className="flex items-start justify-between">
              <div className="max-w-[calc(100%-3rem)]">
                <DialogTitle>Quiz Configuration</DialogTitle>
                <DialogDescription>
                  Customize your quiz settings
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="-mt-1">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
          <QuizTypeSelector 
            onClose={() => setShowQuizDialog(false)} 
            onSubmit={(quizConfig) => handleQuizConfigSubmit(quizConfig, selectedTopic?.name || '')} 
          />
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="relative z-20">
            <div className="flex items-start justify-between">
              <div className="max-w-[calc(100%-3rem)]">
                <DialogTitle>Authentication Required</DialogTitle>
                <DialogDescription>
                  You need to sign in to generate quizzes
                </DialogDescription>
              </div>
              {/* <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose> */}
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-center text-gray-600">Sign in to track your quiz history and progress</p>
            <Button onClick={handleGoToAuth} className="bg-react-primary text-react-secondary hover:bg-react-primary/90">
              Go to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SubtopicsSection;

