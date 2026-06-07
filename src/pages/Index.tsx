
import { useEffect } from 'react';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { WorkStatus } from '../utils/markdown';

const Index = () => {
  // Set status manually since useStatus hook has issues
  const status: WorkStatus = 'Currently Employed';
  
  const [text] = useTypewriter({
    words: ["Data Engineer", "Data Analyst", " AI Automation"],
    loop: true, 
    typeSpeed: 80,
    deleteSpeed: 50,
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            <div className="animate-fade-in max-w-2xl w-full">
              <h1 className="text-5xl font-display font-bold mb-6">
                Hi, I'm Sanath 👋
              </h1>
              <p className="text-2xl text-muted-foreground mb-8">
                A <span className="font-semibold">{text}</span> <Cursor cursorStyle="|" cursorColor="#71717A"/>
              </p>
              <div className="flex items-center space-x-4 mb-8">
                <a href="https://github.com/Sanath-Kumar" target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/sanath-kumar-k/" target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://twitter.com/Sanath_Kumar_K" target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
              <p className="text-muted-foreground mb-6 max-w-xl">
                I'm a data professional passionate about building data pipelines, creating insightful visualizations, and automating complex processes.
                {status && (
                  <div className="mt-4">
                    <span className={`status-badge ${status === 'Open to Work' ? 'available' : 'working'}`}>
                      {status}
                    </span>
                  </div>
                )}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <Link to="/projects" className="cta-button">
                  View Projects
                </Link>
                <Link to="/connect" className="secondary-button inline-flex items-center">
                  Connect With Me
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
