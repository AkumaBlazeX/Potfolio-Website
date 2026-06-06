
import { useEffect } from 'react';
import { useProjects } from '../utils/markdown';
import ProjectCard from '../components/ProjectCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const { projects, loading } = useProjects();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-4 animate-fade-in">Projects</h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            A showcase of data engineering solutions that demonstrate technical expertise and business impact.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="h-96 rounded-2xl bg-muted/40 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={project.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-16 bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center animate-blur-in">
          <h2 className="text-2xl font-semibold mb-4">Interested in my work?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            I'm passionate about solving complex data challenges and would welcome the opportunity to bring my skills to your team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/connect" className="cta-button">
              Contact Me
            </Link>
            <a 
              href="https://www.sanathblogs.online/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="secondary-button inline-flex items-center"
            >
              Read My Blog
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
