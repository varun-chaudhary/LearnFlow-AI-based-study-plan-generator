export type QuizQuestionType = 'mcq' | 'true-false' | 'multiple-correct';
const API_URL = import.meta.env.VITE_BACKEND_API_URL_START;
export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: string[];
  correct_answers: number[];
  explanation?: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

// Get quiz data based on topic
export const getQuizByTopic = async (topic: string, question_type: string, num_questions: number, subTopic: string): Promise<QuizData> => {
  const lowerCaseTopic = topic.toLowerCase();
  
  try {
    const response = await fetch(API_URL + '/gemini-search/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        topic: lowerCaseTopic,
        num_questions: num_questions,
        question_type: question_type,
        subtopic: subTopic,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {topic: lowerCaseTopic, questions: data.quiz.quiz}
  } catch (err) {
    throw new Error(`Failed to fetch quiz data: ${err.message}`);
  }
};
