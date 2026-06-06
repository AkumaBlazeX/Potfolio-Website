import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Linkedin, Mail, Send, ArrowRight, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Connect = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check localStorage for previous submission data
    const storedCount = localStorage.getItem('submission_count');
    const storedTime = localStorage.getItem('last_submission_time');
    
    if (storedCount) setSubmissionCount(parseInt(storedCount));
    if (storedTime) setLastSubmissionTime(parseInt(storedTime));
  }, []);
  
  const sendToGoogleSheet = async (data: { name: string; email: string; message: string }) => {
    try {
      // The URL for the Google Apps Script Web App that will handle the form submission
      // You'll need to create this script and deploy it as a web app
      const scriptURL = 'https://script.google.com/macros/s/AKfycbxpKgMaI0Y8dNHIeiCdu53LapvuIUR_mjpInknwonXI4AHoCt7D7iEA8GMFtQB2f3xb/exec';
      
      // Create a FormData object to send the data
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('message', data.message);
      formData.append('timestamp', new Date().toISOString());
      formData.append('userAgent', navigator.userAgent);
      formData.append('referrer', document.referrer || 'direct');
      
      // Send the data to the Google Sheet
      const response = await fetch(scriptURL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // This is necessary for the Google Apps Script web app
      });
      
      console.log('Data sent to Google Sheet');
      return true;
    } catch (error) {
      console.error('Error sending data to Google Sheet:', error);
      return false;
    }
  };
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting (3 submissions per hour)
    const currentTime = Date.now();
    const oneHourAgo = currentTime - (60 * 60 * 1000);
    
    if (submissionCount >= 3 && lastSubmissionTime > oneHourAgo) {
      toast({
        title: "Too many submissions",
        description: "Please wait before sending another message (limit: 3 per hour).",
        variant: "destructive",
      });
      return;
    }
    
    // Validate inputs
    if (!name || !email || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateEmail(email)) {
      return;
    }
    
    // Basic content validation to prevent spam
    if (message.includes('http') || message.includes('www.')) {
      toast({
        title: "Potential spam detected",
        description: "Please remove any links from your message.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send the data to the Google Sheet
      const sheetResult = await sendToGoogleSheet({
        name,
        email,
        message
      });
      
      if (!sheetResult) {
        toast({
          title: "Error sending message",
          description: "Failed to save your message. Please try again later.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update rate limiting data
      const newCount = submissionCount + 1;
      setSubmissionCount(newCount);
      setLastSubmissionTime(currentTime);
      localStorage.setItem('submission_count', newCount.toString());
      localStorage.setItem('last_submission_time', currentTime.toString());
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');

      toast({
        title: "Message sent successfully",
        description: "Thank you for reaching out. I'll get back to you soon!",
      });

      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Google Sheet submission failed:', error);
      toast({
        title: "Error sending message",
        description: "Failed to save your message. Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-display font-bold mb-4 animate-fade-in">Get In Touch</h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            I'd love to discuss how my skills and experience can benefit your organization.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6">Contact Info</h2>
            
            <div className="space-y-6">
              <a 
                href="mailto:sanathkumar.data@gmail.com" 
                className="flex items-center p-4 rounded-xl transition-all hover:shadow-md bg-background border border-border"
              >
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">sanathkumar.data@gmail.com</p>
                </div>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/sanath-kumar-pv-b4ba8b27b" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 rounded-xl transition-all hover:shadow-md bg-background border border-border"
              >
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Linkedin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">LinkedIn</h3>
                  <p className="text-sm text-muted-foreground">Connect on LinkedIn</p>
                </div>
              </a>
            </div>
            
            <div className="p-6 bg-secondary/50 rounded-xl border border-border">
              <h3 className="font-semibold mb-3">Career Interests</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Full-time data engineering roles
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Remote or hybrid opportunities
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Team-oriented environments
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                  Companies with growth opportunities
                </li>
              </ul>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
            
            {isSubmitted ? (
              <div className="text-center py-8 bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full resize-none"
                    placeholder="I'm interested in discussing potential job opportunities..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cta-button w-full flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Send Message
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Your information will be securely processed and I'll respond as soon as possible.
                </p>
              </form>
            )}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="https://www.sanathblogs.online/"
            target="_blank"
            rel="noopener noreferrer" 
            className="cta-button inline-flex items-center"
          >
            Read My Blog
            <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Connect;
