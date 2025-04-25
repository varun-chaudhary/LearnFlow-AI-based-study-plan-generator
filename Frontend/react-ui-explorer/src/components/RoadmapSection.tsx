import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Code, CheckCircle2, LightbulbIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RoadmapSectionProps {
  topicName: string,
  prerequisites: Array<string>,
  levels: Array<{
    name: string,
    topics: Array<string>,
    howToConquer: string,
    insiderTips: string
  }>
}

const RoadmapSection: React.FC<RoadmapSectionProps> = ({ topicName, prerequisites, levels }) => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>("Basic Level");
  
  const handleLevelClick = (levelName: string) => {
    setExpandedLevel(expandedLevel === levelName ? null : levelName);
  };

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case "Basic Level": return "text-green-500";
      case "Intermediate Level": return "text-yellow-500";
      case "Advanced Level": return "text-red-500";
      case "Expert Level": return "text-blue-500";
      default: return "text-gray-500";
    }
  };
  
  return (
    <section id="roadmap" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            {topicName} Learning <span className="text-react-primary">Roadmap</span>
          </h2>
          <p className="text-gray-600 mb-12">
            Follow this structured path to master {topicName}, from fundamental concepts to advanced techniques
          </p>
        </div>
        
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
              <CardDescription>
                Before diving into {topicName}, ensure you have these foundational skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-left"><ReactMarkdown>{prereq}</ReactMarkdown></span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {levels.map((level, index) => (
            <Card 
              key={index} 
              className={`transition-all duration-300 ${expandedLevel === level.name ? 'border-react-primary shadow-md' : 'card-hover'}`}
            >
              <div 
                className="p-6 flex justify-between items-start cursor-pointer" 
                onClick={() => handleLevelClick(level.name)}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-xl font-bold ${getDifficultyColor(level.name)} mt-1`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-left">{level.name}</h3>
                    <p className="text-sm text-gray-500 text-left">
                      {level["description"]}
                    </p>
                  </div>
                </div>
                <ChevronRight 
                  className={`h-5 w-5 transition-transform flex-shrink-0 mt-1.5 ${expandedLevel === level.name ? 'rotate-90' : ''}`} 
                />
              </div>
              
              {expandedLevel === level.name && (
                <CardContent className="pt-0 pb-6 animate-fade-in">
                  <div className="border-t pt-4 mb-4"></div>
                  
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-left">
                    <Code className="h-4 w-4 text-react-primary flex-shrink-0" />
                    Topics to Cover
                  </h4>
                  <ul className="space-y-2 mb-6">
                    {level.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-react-primary flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-left">{topic}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="conquer">
                      <AccordionTrigger className="text-left font-semibold">
                        How to Conquer This Level
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700 text-left">{level.howToConquer}</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="tips">
                      <AccordionTrigger className="text-left font-semibold">
                        Insider Tips
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-2">
                          <LightbulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <p className="text-gray-700 text-left">{level.insiderTips}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
