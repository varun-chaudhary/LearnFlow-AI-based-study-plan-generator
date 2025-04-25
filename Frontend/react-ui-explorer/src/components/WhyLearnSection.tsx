
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Award, DollarSign, Workflow } from 'lucide-react';

interface WhyLearnSectionProps {
  needToLearn: string;
  topicName: string;
  benefit1Heading: string;
  benefit1Description: string;
  benefit2Heading: string;
  benefit2Description: string;
  benefit3Heading: string;
  benefit3Description: string;
}

const WhyLearnSection: React.FC<WhyLearnSectionProps> = ({
  needToLearn = "",
  topicName = "",
  benefit1Heading = "Productivity",
  benefit1Description = "Improves development workflow and productivity.",
  benefit2Heading = "Versatility",
  benefit2Description = "Can be used for various types of projects.",
  benefit3Heading = "Performance",
  benefit3Description = "Optimizes application performance.",
}) => {
  return (
    <section id="why-learn" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Learn <span className="text-react-primary">{topicName || "React"}?</span>
        </h2>
        
        <div className="prose max-w-3xl mx-auto mb-12 text-center">
          {needToLearn ? (
            <ReactMarkdown>{needToLearn}</ReactMarkdown>
          ) : (
            <p>Learning this technology opens up new opportunities and enhances your skill set.</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <Workflow className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{benefit1Heading}</h3>
              <p className="text-gray-600 text-center">
                {benefit1Description}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <Award className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{benefit2Heading}</h3>
              <p className="text-gray-600 text-center">
                {benefit2Description}
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover border-t-4 border-t-react-primary">
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-react-primary/10 rounded-full">
                  <DollarSign className="w-8 h-8 text-react-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">{benefit3Heading}</h3>
              <p className="text-gray-600 text-center">
                {benefit3Description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WhyLearnSection;
