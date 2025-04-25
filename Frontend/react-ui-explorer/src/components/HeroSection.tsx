
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Code, FileCode, PenTool, Database, Cpu, Braces, Terminal } from 'lucide-react';

interface HeroSectionProps {
  shortDescription: string;
  topicName: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ shortDescription, topicName }) => {
  // Function to select the appropriate icon based on topic name
  const getTopicIcon = () => {
    const topic = topicName.toLowerCase();
    
    if (topic === 'react') {
      return (
        <svg className="w-full h-full react-logo-spin" xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348">
          <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
          <g stroke="#61dafb" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      );
    }
    
    // Map topics to appropriate icons
    switch (topic) {
      case 'javascript':
      case 'js':
        return <Braces className="w-full h-full text-yellow-400 animate-pulse" />;
      case 'python':
        return (
          <div className="flex items-center justify-center w-full h-full">
            <PenTool className="w-3/4 h-3/4 text-blue-500 animate-bounce" />
          </div>
        );
      case 'node':
      case 'nodejs':
      case 'node.js':
        return <Terminal className="w-full h-full text-green-500 animate-pulse" />;
      case 'typescript':
      case 'ts':
        return <FileCode className="w-full h-full text-blue-600 animate-pulse" />;
      case 'database':
      case 'sql':
        return <Database className="w-full h-full text-purple-500 animate-pulse" />;
      case 'ai':
      case 'machine learning':
      case 'ml':
        return <Cpu className="w-full h-full text-red-500 animate-pulse" />;
      default:
        return <Code className="w-full h-full text-gray-400 animate-pulse" />;
    }
  };

  return (
    <section id="introduction" className="py-16 bg-gradient-to-b from-react-secondary to-react-secondary/90 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Learn <span className="text-react-primary">{topicName}</span>
            </h1>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{shortDescription}</ReactMarkdown>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                {getTopicIcon()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
