
import { Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sanath Kumar</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Data engineering professional specializing in building efficient, scalable data pipelines and solutions.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/sanath-kumar-pv-b4ba8b27b" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:sanathkumar.data@gmail.com" 
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/experience" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Experience
                </Link>
              </li>
              <li>
                <Link to="/connect" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Connect
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.sanathblogs.onlinr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <p className="text-muted-foreground text-sm">
              Interested in hiring me? Let's discuss how I can contribute to your team.
            </p>
            <Link to="/connect" className="cta-button text-sm">
              Get In Touch
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-center text-muted-foreground text-xs">
            © {currentYear} SanathDev. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
