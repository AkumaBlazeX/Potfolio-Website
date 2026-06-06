import { useEffect, useState } from 'react';

export interface Project {
  id: string;
  title: string;
  description: string;
  tools: string[];
  results: string[];
  date: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface Experience {
  id?: string;
  role: string;
  company?: string;
  period?: string;
  location?: string;
  responsibilities: string[];
  achievements?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

export type WorkStatus = 'Open to Work' | 'Currently Employed';

// Unified section splitter that is immune to missing top-level newlines
const splitSections = (text: string) => {
  const parts = text.split(/\n##\s+|###\s+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];
  // If the first section contains the main H1 file title, prune it out safely
  if (parts[0].startsWith('#')) {
    parts[0] = parts[0].replace(/^#.*?\n/, '').trim();
  }
  return parts;
};

const parseExperienceText = (text: string): Experience[] => {
  // Safe extraction for standard ## headers or raw file text
  const sections = text.includes('## ') ? splitSections(text) : [text.trim()];
  const results: Experience[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const role = lines[0].replace(/^##\s+/, '').trim();
    if (role.toLowerCase().startsWith('experience')) return; // Skip title headers

    const item: Experience = { role, responsibilities: [], achievements: [] };
    let currentTrackingList: 'resp' | 'ach' | null = null;

    lines.slice(1).forEach(line => {
      const kv = line.match(/^[-*]\s*([^:]+):\s*(.*)$/);
      if (kv) {
        currentTrackingList = null; // Reset block context
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        
        if (key === 'company') item.company = val;
        else if (key === 'period') item.period = val;
        else if (key === 'location') item.location = val;
      } else if (line.toLowerCase().startsWith('- responsibilities:') || line.toLowerCase().startsWith('- responsibility:')) {
        currentTrackingList = 'resp';
      } else if (line.toLowerCase().startsWith('- achievements:') || line.toLowerCase().startsWith('- achievement:')) {
        currentTrackingList = 'ach';
      } else {
        const bulletMatch = line.match(/^[-*+]\s+(.*)$/) || line.match(/^\s+[-*+]\s+(.*)$/);
        if (bulletMatch) {
          const content = bulletMatch[1].trim();
          if (currentTrackingList === 'resp') item.responsibilities.push(content);
          if (currentTrackingList === 'ach') item.achievements?.push(content);
        }
      }
    });

    if (item.company || item.responsibilities.length) {
      results.push(item);
    }
  });

  return results;
};

const parseProjectsText = (text: string): Project[] => {
  const sections = splitSections(text);
  const results: Project[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const title = lines[0].replace(/^##\s+/, '').trim();
    if (title.toLowerCase().startsWith('projects')) return;

    const proj: Project = { 
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 
      title, 
      description: '', 
      tools: [], 
      results: [] ,
      date: ''
    };
    
    let currentTrackingList: 'tools' | 'results' | null = null;

    lines.slice(1).forEach(line => {
      const kv = line.match(/^[-*]\s*([^:]+):\s*(.*)$/);
      if (kv) {
        currentTrackingList = null;
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        
        if (key === 'date') proj.date = val;
        else if (key === 'description') proj.description = val;
        else if (key === 'url' || key === 'githuburl') proj.githubUrl = val;
      } else if (line.toLowerCase().startsWith('- tools:')) {
        currentTrackingList = 'tools';
      } else if (line.toLowerCase().startsWith('- results:')) {
        currentTrackingList = 'results';
      } else {
        const bulletMatch = line.match(/^[-*+]\s+(.*)$/) || line.match(/^\s+[-*+]\s+(.*)$/);
        if (bulletMatch) {
          const content = bulletMatch[1].trim();
          if (currentTrackingList === 'tools') proj.tools.push(content);
          if (currentTrackingList === 'results') proj.results.push(content);
        }
      }
    });

    results.push(proj);
  });

  return results;
};

const parseSkillsText = (text: string): Skill[] => {
  const sections = splitSections(text);
  const skills: Skill[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const category = lines[0].replace(/^##\s+/, '').trim();
    if (category.toLowerCase().startsWith('skills')) return;

    lines.slice(1).forEach(line => {
      // Fallback parser checking for either "- Python: 5" OR "- name: Python" layouts
      const simpleKv = line.match(/^[-*]\s*([^:]+):\s*(\d+)$/);
      if (simpleKv) {
        const name = simpleKv[1].trim();
        const prof = parseInt(simpleKv[2], 10) || 4;
        skills.push({ 
          id: (category + '-' + name).toLowerCase().replace(/[^a-z0-9]+/g, '-'), 
          name, 
          category, 
          proficiency: prof 
        });
      }
    });
  });

  return skills;
};

const parseStatusText = (text: string): WorkStatus => {
  const m = text.match(/status:\s*(.*)/i);
  if (!m) return 'Currently Employed';
  return /open/i.test(m[1].trim()) ? 'Open to Work' : 'Currently Employed';
};

// --- Standardized React Pipeline Hooks utilizing Vite Glob Importers ---
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const modules = import.meta.glob('../content/projects.md', { query: '?raw', import: 'default' });
        for (const loader of Object.values(modules)) {
          const txt = await loader() as string;
          setProjects(parseProjectsText(txt));
        }
      } catch (e) {
        console.error("Failed to parse projects:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { projects, loading };
};

export const useExperience = () => {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const modules = import.meta.glob('../content/experience.md', { query: '?raw', import: 'default' });
        for (const loader of Object.values(modules)) {
          const txt = await loader() as string;
          setExperience(parseExperienceText(txt));
        }
      } catch (e) {
        console.error("Failed to parse experience:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { experience, loading };
};

export const useSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const modules = import.meta.glob('../content/skills.md', { query: '?raw', import: 'default' });
        for (const loader of Object.values(modules)) {
          const txt = await loader() as string;
          setSkills(parseSkillsText(txt));
        }
      } catch (e) {
        console.error("Failed to parse skills:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { skills, loading };
};

export const useWorkStatus = () => {
  const [status, setStatus] = useState<WorkStatus>('Currently Employed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const modules = import.meta.glob('../content/status.md', { query: '?raw', import: 'default' });
        for (const loader of Object.values(modules)) {
          const txt = await loader() as string;
          setStatus(parseStatusText(txt));
        }
      } catch (e) {
        console.error("Failed to parse status:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { status, loading };
};
