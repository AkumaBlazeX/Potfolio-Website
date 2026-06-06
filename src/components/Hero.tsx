
import { ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkStatus } from '../utils/markdown';

const Hero = () => {
  const { status, loading } = useWorkStatus();

  return (
    <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-6 z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {!loading && (
            <div className={`status-badge mx-auto ${status === 'Open to Work' ? 'available' : 'working'} animate-fade-in`}>
              {status}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight animate-fade-in">
            Data Engineering<br /> 
            <span className="text-primary">Solutions Architect</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Building scalable, efficient data pipelines and solutions that transform raw data into 
            actionable insights. Looking to bring my expertise to your team.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link to="/projects" className="cta-button">
              View My Projects
            </Link>
            <Link to="/experience" className="secondary-button">
              View My Experience
            </Link>
          </div>
          
          <div className="pt-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <a 
              href="https://www.sanathblogs.online/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1.5 transition-colors"
            >
              Read my tech blog
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <a 
            href="#featured" 
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Scroll down"
          >
            <ArrowDown className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
