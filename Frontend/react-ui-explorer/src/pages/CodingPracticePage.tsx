import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { autocompletion } from '@codemirror/autocomplete';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Send, CheckCircle, XCircle, Code, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Sample question data
const sampleQuestion = {
  title: "Two Sum",
  difficulty: "Easy",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
    }
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ]
};

const CodingPracticePage = () => {
  const [code, setCode] = useState(`function twoSum(nums, target) {
    // Your code here
};`);
  const [activeTab, setActiveTab] = useState('description');
  const [testResults, setTestResults] = useState<Array<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }> | null>(null);
  const [language, setLanguage] = useState('javascript');

  const getExtensions = () => {
    switch(language) {
      case 'python':
        return [python(), autocompletion()];
      case 'java':
        return [java(), autocompletion()];
      case 'cpp':
        return [cpp(), autocompletion()];
      default:
        return [javascript(), autocompletion()];
    }
  };

  const handleRun = () => {
    // Simulate running test cases
    const results = sampleQuestion.examples.map(example => ({
      input: example.input,
      expected: example.output,
      actual: "[0,1]", // This would be the actual output from the code
      passed: true // This would be determined by comparing actual and expected
    }));
    setTestResults(results);
    toast.success("Tests completed!");
  };

  const handleSubmit = () => {
    // Simulate submission
    toast.info("Submitting your solution...");
    setTimeout(() => {
      toast.success("All test cases passed!");
    }, 1500);
  };

  return (
    <div className="container mx-auto p-4 min-h-[90vh]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Question */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">{sampleQuestion.title}</h1>
              <Badge 
                variant={sampleQuestion.difficulty === "Easy" ? "default" : 
                        sampleQuestion.difficulty === "Medium" ? "secondary" : "destructive"}
                className="text-sm"
              >
                {sampleQuestion.difficulty}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                Hint
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discuss
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="description" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Description
              </TabsTrigger>
              <TabsTrigger value="solution" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Solution
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{sampleQuestion.description}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Examples
                </h3>
                {sampleQuestion.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">Example {index + 1}:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Input:</p>
                          <p className="font-mono text-sm bg-gray-100 p-2 rounded">{example.input}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Output:</p>
                          <p className="font-mono text-sm bg-gray-100 p-2 rounded">{example.output}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Explanation: {example.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Constraints
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ul className="space-y-3">
                    {sampleQuestion.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <span className="ml-3 text-gray-700 font-mono text-sm">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="solution">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600">Solutions will be available after you submit your code.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="discussion">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600">Discussion forum will be available after you submit your code.</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Right side - Code Editor and Test Cases */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleRun}>
                  <Play className="h-4 w-4 mr-2" />
                  Run
                </Button>
                <Button variant="default" size="sm" onClick={handleSubmit}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            
            <CodeMirror
              value={code}
              height="24rem"
              theme="dark"
              extensions={getExtensions()}
              onChange={(value) => setCode(value)}
              basicSetup={{ lineNumbers: true, autocompletion: true }}
              className="editor-left-align"
              style={{ borderRadius: '0.5rem', fontSize: '1rem', textAlign: 'left' }}
            />
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4 text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
              Test Cases
            </h3>
            <div className="space-y-4">
              {sampleQuestion.examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Test Case {index + 1}</span>
                    {testResults && (
                      testResults[index].passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Input</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{example.input}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected Output</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{example.output}</p>
                    </div>
                  </div>
                  {testResults && !testResults[index].passed && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Your Output</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{testResults[index].actual}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodingPracticePage; 