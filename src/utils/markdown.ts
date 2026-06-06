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

const splitSections = (text: string) => {
  const parts = text.split(/\n##\s+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];
  if (parts[0].startsWith('#')) {
    parts[0] = parts[0].replace(/^#.*?\n/, '').trim();
  }
  return parts;
};

const parseExperienceText = (text: string): Experience[] => {
  const sections = splitSections(text);
  const results: Experience[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.replace(/\r/g, ''));
    if (!lines.length) return;

    const role = lines[0].replace(/^##\s+/, '').trim();
    if (role.toLowerCase().startsWith('experience')) return;

    const item: Experience = { role, responsibilities: [], achievements: [] };
    let activeMode: 'resp' | 'ach' | null = null;

    for (let i = 1; i < lines.length; i++) {
      const origLine = lines[i];
      const trimmed = origLine.trim();
      if (!trimmed) continue;

      if (trimmed.toLowerCase().includes('responsibilities:')) {
        activeMode = 'resp';
        continue;
      }
      if (trimmed.toLowerCase().includes('achievements:')) {
        activeMode = 'ach';
        continue;
      }

      const kv = trimmed.match(/^[-*]?\s*([^:]+):\s*(.*)$/);
      if (kv && !origLine.startsWith(' ') && !origLine.startsWith('\t')) {
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        if (key === 'company') item.company = val;
        else if (key === 'period') item.period = val;
        else if (key === 'location') item.location = val;
        activeMode = null;
        continue;
      }

      const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/) || [null, trimmed];
      const content = bulletMatch[1]?.trim();
      
      if (content) {
        if (activeMode === 'resp') item.responsibilities.push(content);
        if (activeMode === 'ach') item.achievements?.push(content);
      }
    }

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
    const lines = sec.split('\n').map(l => l.replace(/\r/g, ''));
    if (!lines.length) return;

    const title = lines[0].replace(/^##\s+/, '').trim();
    if (title.toLowerCase().startsWith('projects')) return;

    const proj: Project = { 
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 
      title, 
      description: '', 
      tools: [], 
      results: [], 
      date: '' 
    };
    
    let activeMode: 'tools' | 'results' | null = null;

    for (let i = 1; i < lines.length; i++) {
      const origLine = lines[i];
      const trimmed = origLine.trim();
      if (!trimmed) continue;

      if (trimmed.toLowerCase().includes('tools:')) {
        activeMode = 'tools';
        continue;
      }
      if (trimmed.toLowerCase().includes('results:')) {
        activeMode = 'results';
        continue;
      }

      const kv = trimmed.match(/^[-*]?\s*([^:]+):\s*(.*)$/);
      if (kv && !origLine.startsWith(' ') && !origLine.startsWith('\t')) {
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        if (key === 'date') proj.date = val;
        else if (key === 'description') proj.description = val;
        else if (key === 'url' || key === 'githuburl') proj.githubUrl = val;
        activeMode = null;
        continue;
      }

      const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/) || [null, trimmed];
      const content = bulletMatch[1]?.trim();

      if (content) {
        if (activeMode === 'tools') proj.tools.push(content);
        if (activeMode === 'results') proj.results.push(content);
      }
    }

    results.push(proj);
  });

  return results;
};

const parseSkillsText = (text: string): Skill[] => {
  const sections = text.split(/\n##\s+/).map(p => p.trim()).filter(Boolean);
  const skills: Skill[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const category = lines[0].replace(/^#+\s+/, '').trim();
    if (category.toLowerCase().startsWith('skills')) return;

    lines.slice(1).forEach(line => {
      const simpleKv = line.match(/^[-*]?\s*([^:]+):\s*(\d+)$/);
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
