
import { ExternalLink, Github } from 'lucide-react';
import { type Project } from '../utils/markdown';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <div 
      className="glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-muted-foreground">{project.date}</span>
            <h3 className="text-xl font-semibold mt-1">{project.title}</h3>
          </div>
          <div className="flex space-x-2">
            <a 
              href="https://github.com/AkumaBlazeX?tab=repositories" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="View GitHub repository"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/AkumaBlazeX?tab=repositories" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="Project details"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <p className="text-muted-foreground">{project.description}</p>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Tools Used</h4>
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool, i) => (
              <span 
                key={i} 
                className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Key Results</h4>
          <ul className="space-y-1">
            {project.results.map((result, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                {result}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
