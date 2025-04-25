
import React from 'react';
import { Code, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-react-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Code size={24} className="text-react-primary" />
            <span className="text-xl font-bold">LearnFlow</span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="hover:text-react-primary transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="hover:text-react-primary transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Examples</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Learn</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Getting Started</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Interactive Tutorials</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Ecosystem</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">React Router</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Redux</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Next.js</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">React Native</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">More</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">About</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-react-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>© 2025 LearnFlow. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
