
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FaqSectionProps {
  topicName: string,
  frequentlyAskedQuestions: Array<{
    question: string;
    answer: string;
  }>
}

const FaqSection: React.FC<FaqSectionProps> = ({ topicName, frequentlyAskedQuestions }) => {
  return (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Frequently Asked <span className="text-react-primary">Questions</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Common questions about {topicName} and their answers
        </p>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {frequentlyAskedQuestions.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-left font-medium py-4 flex gap-2">
                  <div className="flex gap-2 items-center">
                    <HelpCircle className="h-5 w-5 text-react-primary flex-shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 py-4 pl-7">
                  <ReactMarkdown>{faq.answer}</ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
