
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface KeyTakeawaysSectionProps {
  topicName: string;
  keyTakeaways: Array<string>;
}

const KeyTakeawaysSection: React.FC<KeyTakeawaysSectionProps> = ({ topicName, keyTakeaways }) => {
  return (
    <section id="key-takeaways" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Key <span className="text-react-primary">Takeaways</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          The essential {topicName} concepts you need to remember
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keyTakeaways.map((takeaway, index) => (
            <Card key={index} className="card-hover bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-1 bg-green-100 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-gray-700">{takeaway}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyTakeawaysSection;
