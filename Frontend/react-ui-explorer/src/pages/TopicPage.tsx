import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, BookOpen, Map, ListChecks, HelpCircle, LinkIcon, Check, Link2, Menu, X, Brain, ExternalLink, ChevronDown, Plus } from 'lucide-react';
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import HeroSection from '@/components/HeroSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import RoadmapSection from '@/components/RoadmapSection';
import SubtopicsSection from '@/components/SubtopicsSection';
import KeyTakeawaysSection from '@/components/KeyTakeawaysSection';
import FaqSection from '@/components/FaqSection';
import RelatedTopicsSection from '@/components/RelatedTopicsSection';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import QuizTypeSelector from '@/components/QuizTypeSelector';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ResourcesDialog from '@/components/ResourcesDialog';

const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;

interface TopicData {
  [topic: string]: {
    shortDescription: {
      description: string;
    };
    needToLearnReact: {
      description: string;
    };
    subTopics: {
      description: {
        subtopics: Array<{
          name: string;
          description: string;
          difficulty: string;
          timeToComplete: string;
          whyItMatters: string;
          commonMistakes: string[];
        }>;
      };
    };
    roadMapToLearnReact: {
      description: {
        prerequisites: string[];
        levels: Array<{
          name: string;
          description: string;
          topics: string[];
          howToConquer: string;
          insiderTips: string;
        }>;
      };
    };
    keyTakeaways: {
      description: string[];
    };
    frequentlyAskedQuestions: {
      description: Array<{
        question: string;
        answer: string;
      }>;
    };
    relatedTopics: {
      description: Array<{
        topic: string;
        description: string;
      }>;
    };
  };
}

const TopicPage = () => {
  const [topicName, setTopicName] = useState<string>(useParams().topic || '');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedTopicName, setFormattedTopicName] = useState<string>(topicName ? topicName.charAt(0).toUpperCase() + topicName.slice(1) : '');
  const [activeSection, setActiveSection] = useState('introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated } = useAuth();
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showTopicResourcesDialog, setShowTopicResourcesDialog] = useState(false);
  const [topicVideos, setTopicVideos] = useState<any[]>([]);
  const [topicArticles, setTopicArticles] = useState<any[]>([]);
  const [topicDocumentation, setTopicDocumentation] = useState<any[]>([]);
  const [loadingTopicVideos, setLoadingTopicVideos] = useState(false);
  const [loadingTopicArticles, setLoadingTopicArticles] = useState(false);
  const [loadingTopicDocumentation, setLoadingTopicDocumentation] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (navRef.current) {
        const nav = navRef.current;
        const isOverflowing = nav.scrollWidth > nav.clientWidth;
        setShowHamburger(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  useEffect(() => {
    fetchTopicData()
    async function fetchTopicData() {
      setLoading(true);
      
      if (!topicName) {
        setError("No topic specified");
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(API_URL + '/gemini-search/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            search_query: topicName,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        const resultData = await JSON.parse(data.result);
        setTopicData(resultData[resultData["topic"]]);
        setTopicName(resultData["topic"]);

        const splitTopicName = resultData["topic"].toString().split('-');
        const lastPart = splitTopicName[splitTopicName.length - 1];
        const capitalizedLastPart = lastPart
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        setFormattedTopicName(capitalizedLastPart);  

        setLoading(false);
        
        window.dispatchEvent(new Event('topicContentLoaded'));
      } catch (err) {
        console.error("Error fetching topic data:", err);
        setError(`Failed to load data for "${formattedTopicName}". Please try again later.`);
        setLoading(false);
      }
    }
  }, [topicName]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px',  // Consider element visible when it's in the middle of viewport
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    const sections = [
      'introduction',
      'why-learn',
      'roadmap',
      'subtopics',
      'key-takeaways',
      'faq',
      'related'
    ];

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [topicData]); // Re-run when topicData changes as sections might not be available immediately

  const goBack = () => {
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    if (newState) {
      // When opening menu, focus the button
      menuButtonRef.current?.focus();
    } else {
      // When closing menu, remove focus and reset button state
      menuButtonRef.current?.blur();
      // Force a re-render of the button by toggling a temporary class
      menuButtonRef.current?.classList.add('reset-state');
      setTimeout(() => {
        menuButtonRef.current?.classList.remove('reset-state');
      }, 0);
    }
  };

  const handleGenerateQuiz = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowQuizDialog(true);
  };

  const handleQuizConfigSubmit = (quizConfig: any) => {
    setShowQuizDialog(false);
    navigate(`/quiz/${topicName}`, { state: { quizConfig } });
  };

  const handleGoToAuth = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  const handleGenerateTopicResources = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowTopicResourcesDialog(true);
    
    // Reset states
    setTopicVideos([]);
    setTopicArticles([]);
    setTopicDocumentation([]);
    setLoadingTopicVideos(true);
    setLoadingTopicArticles(true);
    setLoadingTopicDocumentation(true);

    const requestBody = {
      topic_name: topicName
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
      if (data.videos) setTopicVideos(data.videos);
    })
    .catch(error => {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
    })
    .finally(() => {
      setLoadingTopicVideos(false);
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
      if (data.articles) setTopicArticles(data.articles);
    })
    .catch(error => {
      console.error('Error loading articles:', error);
      toast.error('Failed to load articles');
    })
    .finally(() => {
      setLoadingTopicArticles(false);
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
      if (data.documentation) setTopicDocumentation(data.documentation);
    })
    .catch(error => {
      console.error('Error loading documentation:', error);
      toast.error('Failed to load documentation');
    })
    .finally(() => {
      setLoadingTopicDocumentation(false);
    });
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] safe-top safe-bottom">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-react-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Generating content...</h2>
          <p className="text-gray-500">Creating a comprehensive guide for {formattedTopicName}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] safe-top safe-bottom">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">Oops! Something went wrong</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Button onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-theme(spacing.16)-theme(spacing.16))] safe-top safe-bottom">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No data found</h2>
          <Button onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow pb-16 lg:pb-0 relative overflow-x-hidden">
      <div className="container mx-auto px-4 safe-left safe-right">
        <div className="hidden lg:flex items-center py-2">
          {/* Desktop Back Button */}
          <Button 
            variant="outline" 
            onClick={goBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>

          {/* Desktop Navigation */}
          <div className="flex flex-1 flex-wrap justify-end gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('introduction')}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Intro
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('why-learn')}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Why Learn
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('roadmap')}
            >
              <Map className="h-3.5 w-3.5" />
              Roadmap
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('subtopics')}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Topics
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('key-takeaways')}
            >
              <Check className="h-3.5 w-3.5" />
              Takeaways
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('faq')}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5"
              onClick={() => scrollToSection('related')}
            >
              <Link2 className="h-3.5 w-3.5" />
              Related
            </Button>

            {/* Desktop Generate Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  Generate
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGenerateQuiz} className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Generate Quiz
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateTopicResources} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Generate Content
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <HeroSection shortDescription={topicData["Short Description"]?.["Description"]?.toString() || ""} topicName={formattedTopicName} />
      <WhyLearnSection 
          needToLearn={topicData[`Need to Learn ${topicName}`]?.["Description"]?.toString() || ""}
          topicName={formattedTopicName} 
          benefit1Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 1"]?.["heading"]?.toString() || ""}
          benefit1Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 1"]?.["description"]?.toString() || ""}
          benefit2Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 2"]?.["heading"]?.toString() || ""}
          benefit2Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 2"]?.["description"]?.toString() || ""}
          benefit3Heading={topicData[`Need to Learn ${topicName}`]?.["Benefit 3"]?.["heading"]?.toString() || ""}
          benefit3Description={topicData[`Need to Learn ${topicName}`]?.["Benefit 3"]?.["description"]?.toString() || ""}
      />
      <RoadmapSection topicName={formattedTopicName} prerequisites={topicData[`Road Map to Learn ${topicName}`]?.["Description"]?.['prerequisites'] || []} levels={topicData[`Road Map to Learn ${topicName}`]?.["Description"]?.['levels'] || []} />
      <SubtopicsSection subTopics={topicData["SubTopics"]?.["Description"]?.["subtopics"] || []} topicName={formattedTopicName} />
      <KeyTakeawaysSection keyTakeaways={topicData["Key Takeaways"]?.["Description"] || []} topicName={formattedTopicName} />
      <FaqSection topicName={formattedTopicName} frequentlyAskedQuestions={topicData["Frequently Asked Questions"]?.["Description"] || []} />
      <RelatedTopicsSection topicName={formattedTopicName} relatedTopics={topicData["Related Topics"]?.["Description"] || []} />

      {/* Mobile Floating Action Buttons */}
      <motion.div
        className="lg:hidden fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {/* Drop-up Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 mb-2"
            >
              {/* Quiz Button */}
        <motion.button
          onClick={handleGenerateQuiz}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-react-primary text-react-secondary shadow-xl relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(97, 218, 251, 0.4)",
                    "0 0 0 10px rgba(97, 218, 251, 0)",
                    "0 0 0 0 rgba(97, 218, 251, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Brain className="h-6 w-6" />
                <span className="sr-only">Generate Quiz</span>
                
                {/* Pulsing Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-react-primary"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Additional Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-react-primary/20 blur-sm"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>

              {/* Resources Button */}
              <motion.button
                onClick={handleGenerateTopicResources}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-react-primary text-react-secondary shadow-xl relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(97, 218, 251, 0.4)",
                    "0 0 0 10px rgba(97, 218, 251, 0)",
                    "0 0 0 0 rgba(97, 218, 251, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <BookOpen className="h-6 w-6" />
                <span className="sr-only">Generate Resources</span>
                
                {/* Pulsing Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-react-primary"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Additional Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-react-primary/20 blur-sm"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Generate Button */}
        <motion.button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-react-primary text-react-secondary shadow-2xl relative"
          aria-label="Generate"
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(97, 218, 251, 0.4)",
              "0 0 0 20px rgba(97, 218, 251, 0)",
              "0 0 0 0 rgba(97, 218, 251, 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <motion.div
            animate={{
              rotate: showMobileMenu ? 135 : 0,
              transition: { duration: 0.2 }
            }}
          >
            <Plus className="h-8 w-8" />
          </motion.div>
          <span className="sr-only">Generate</span>
          
          {/* Pulsing Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-3 border-react-primary"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Additional Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-react-primary/20 blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      </motion.div>

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quiz Configuration</DialogTitle>
            <DialogDescription>
              Customize your quiz settings
            </DialogDescription>
          </DialogHeader>
          <QuizTypeSelector onClose={() => setShowQuizDialog(false)} onSubmit={handleQuizConfigSubmit} />
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to sign in to generate quizzes
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-center text-gray-600">Sign in to track your quiz history and progress</p>
            <Button onClick={handleGoToAuth} className="bg-react-primary text-react-secondary hover:bg-react-primary/90">
              Go to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resources Dialog */}
      <ResourcesDialog
        isOpen={showTopicResourcesDialog}
        onOpenChange={setShowTopicResourcesDialog}
        topicName={formattedTopicName}
        subtopicName={null}
        videos={topicVideos}
        articles={topicArticles}
        documentation={topicDocumentation}
        loadingVideos={loadingTopicVideos}
        loadingArticles={loadingTopicArticles}
        loadingDocumentation={loadingTopicDocumentation}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 safe-left safe-right">
        {/* Bottom Navigation Bar - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200/50 dark:border-gray-700/50 lg:hidden safe-bottom">
          <div className="flex justify-between items-center px-3 py-2 max-w-md mx-auto">
            <button
              onClick={() => scrollToSection('introduction')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'introduction' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <BookOpen className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">Intro</span>
            </button>

            <button
              onClick={() => scrollToSection('why-learn')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'why-learn' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <ListChecks className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">Why</span>
            </button>

            <button
              onClick={() => scrollToSection('roadmap')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'roadmap' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Map className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">Path</span>
            </button>

            <button
              onClick={() => scrollToSection('subtopics')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'subtopics' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <LinkIcon className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">Topics</span>
            </button>

            <button
              onClick={() => scrollToSection('key-takeaways')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'key-takeaways' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Check className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">Key</span>
            </button>

            <button
              onClick={() => scrollToSection('faq')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'faq' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <HelpCircle className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">FAQ</span>
            </button>

            <button
              onClick={() => scrollToSection('related')}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeSection === 'related' 
                  ? 'text-react-primary bg-react-primary/10 dark:bg-react-primary/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Link2 className="h-5 w-5 mb-1" />
              <span className="text-[0.65rem] font-medium">Related</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
