import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Code } from 'lucide-react';
import { toast } from "sonner";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make POST request to the specified endpoint
      navigate(`/topic/${encodeURIComponent(searchQuery.toLowerCase())}`);
    } catch (error) {
      console.error('Error during search:', error);
      toast.error("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Learn <span className="text-react-primary">Any Technology</span> Interactively
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Search for any technology or programming concept you want to learn. 
            We'll generate a comprehensive learning path and resources to help you master it.
          </p>
          
          <form onSubmit={handleSearch} className="flex w-full max-w-xl mx-auto mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for a technology (e.g., React, Python, Machine Learning)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg w-full"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="ml-2 bg-react-primary text-react-secondary hover:bg-react-primary/90 py-6 px-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : 'Learn'}
            </Button>
          </form>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {['React', 'TypeScript', 'Python', 'Node.js'].map((topic) => (
              <Button
                key={topic}
                variant="outline"
                className="py-6 border-gray-200 hover:border-react-primary hover:bg-gray-50"
                onClick={() => {
                  setSearchQuery(topic);
                }}
                disabled={isLoading}
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
