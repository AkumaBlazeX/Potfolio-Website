import { useEffect, useState } from 'react';

// Define types for our content
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
  proficiency: number; // 1-5
}

export type WorkStatus = 'Open to Work' | 'Currently Employed';

// --- Simple markdown parsers tailored to the repo's content format ---
const splitSections = (text: string) => {
  // Split on '## ' headings, ignore the first chunk (the file-level title)
  const parts = text.split(/\n##\s+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return [];
  // first part may contain the file title; drop it when it starts with '#'
  if (parts[0].startsWith('#') || parts[0].toLowerCase().startsWith('projects') || parts[0].toLowerCase().startsWith('experience') || parts[0].toLowerCase().startsWith('skills')) {
    return parts.slice(1);
  }
  return parts;
};

const parseListItems = (lines: string[], startIndex: number) => {
  const items: string[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*-\s+/.test(l)) {
      // top-level key (stop)
      break;
    }
    const m = l.match(/^\s*-\s+(.*)$/);
    if (m) items.push(m[1].trim());
    else {
      const m2 = l.match(/^\s*[-*]\s+(.*)$/);
      if (m2) items.push(m2[1].trim());
    }
  }
  return items;
};

const parseExperienceText = (text: string): Experience[] => {
  const sections = splitSections(text);
  const results: Experience[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.replace(/\r/g, ''));
    const title = lines[0].trim(); // role/title
    const item: Experience = { role: title, responsibilities: [], achievements: [] } as Experience;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const kv = line.match(/^[-]\s*([^:]+):\s*(.*)$/);
      if (kv) {
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        if (key === 'company') item.company = val;
        else if (key === 'period') item.period = val;
        else if (key === 'location') item.location = val;
        else if (key === 'description') item.responsibilities.push(val);
        else if (key === 'responsibilities') {
          // collect following indented list
          const nested: string[] = [];
          for (let j = i + 1; j < lines.length; j++) {
            const nl = lines[j];
            // stop when encountering another top-level key like '- tools:' or '- description:'
            if (/^\s*-\s*[^:]+:\s*/.test(nl)) break;
            const m = nl.match(/^\s*-\s+(.*)$/);
            if (m) nested.push(m[1].trim());
            else {
              const mm = nl.match(/^\s{2,}-\s+(.*)$/);
              if (mm) nested.push(mm[1].trim());
              else {
                // not a nested list item
                break;
              }
            }
          }
          if (nested.length) item.responsibilities.push(...nested);
        } else if (key === 'achievements') {
          const nested: string[] = [];
          for (let j = i + 1; j < lines.length; j++) {
            const nl = lines[j];
            if (/^\s*-\s*[^:]+:\s*/.test(nl)) break;
            const m = nl.match(/^\s*-\s+(.*)$/);
            if (m) nested.push(m[1].trim());
            else {
              const mm = nl.match(/^\s{2,}-\s+(.*)$/);
              if (mm) nested.push(mm[1].trim());
              else break;
            }
          }
          if (nested.length) item.achievements = nested;
        }
      }
    }
    results.push(item);
  });

  return results;
};

const parseProjectsText = (text: string): Project[] => {
  const sections = splitSections(text);
  const results: Project[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.replace(/\r/g, ''));
    const title = lines[0].trim();
    const proj: Project = { id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, description: '', tools: [], results: [], date: '' };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const kv = line.match(/^[-]\s*([^:]+):\s*(.*)$/);
      if (kv) {
        const key = kv[1].trim().toLowerCase();
        const val = kv[2].trim();
        if (key === 'date') proj.date = val;
        else if (key === 'description') proj.description = val;
        else if (key === 'tools') {
          // collect following indented tools
          const tools: string[] = [];
          for (let j = i + 1; j < lines.length; j++) {
            const nl = lines[j];
            if (/^\s*-\s+/.test(nl)) break;
            const m = nl.match(/^\s*-\s+(.*)$/);
            if (m) tools.push(m[1].trim());
          }
          proj.tools = tools;
        } else if (key === 'results') {
          const res: string[] = [];
          for (let j = i + 1; j < lines.length; j++) {
            const nl = lines[j];
            if (/^\s*-\s*[^:]+:\s*/.test(nl)) break;
            const m = nl.match(/^\s*-\s+(.*)$/);
            if (m) res.push(m[1].trim());
            else {
              const mm = nl.match(/^\s{2,}-\s+(.*)$/);
              if (mm) res.push(mm[1].trim());
              else break;
            }
          }
          proj.results = res;
        }
      }
    }

    results.push(proj);
  });

  return results;
};

const parseSkillsText = (text: string): Skill[] => {
  const sections = splitSections(text);
  const skills: Skill[] = [];

  sections.forEach(sec => {
    const lines = sec.split('\n').map(l => l.replace(/\r/g, ''));
    const category = lines[0].trim();
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const kv = line.match(/^[-]\s*([^:]+):\s*(\d+)$/);
      if (kv) {
        const name = kv[1].trim();
        const prof = parseInt(kv[2], 10) || 0;
        skills.push({ id: (category + '-' + name).toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, category, proficiency: prof });
      }
    }
  });

  return skills;
};

const parseStatusText = (text: string): WorkStatus => {
  const m = text.match(/status:\s*(.*)/i);
  if (!m) return 'Currently Employed';
  const raw = m[1].trim();
  if (/open/i.test(raw)) return 'Open to Work';
  return 'Currently Employed';
};

// --- Hooks that load and parse markdown files using Vite's import.meta.glob ---
export const useProjects = (): { projects: Project[]; loading: boolean } => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // @ts-ignore - Vite import
        const modules = import.meta.glob('../content/*.md', { as: 'raw' }) as Record<string, () => Promise<string>>;
        const entries = Object.entries(modules);
        for (const [path, loader] of entries) {
          if (path.endsWith('projects.md')) {
            const txt = await loader();
            const parsed = parseProjectsText(txt);
            if (mounted) setProjects(parsed.length ? parsed : []);
            break;
          }
        }
      } catch (e) {
        // swallow and keep empty
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { projects, loading };
};

export const useExperience = (): { experience: Experience[]; loading: boolean } => {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // @ts-ignore
        const modules = import.meta.glob('../content/*.md', { as: 'raw' }) as Record<string, () => Promise<string>>;
        const entries = Object.entries(modules);
        for (const [path, loader] of entries) {
          if (path.endsWith('experience.md')) {
            const txt = await loader();
            const parsed = parseExperienceText(txt);
            if (mounted) setExperience(parsed.length ? parsed : []);
            break;
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { experience, loading };
};

export const useSkills = (): { skills: Skill[]; loading: boolean } => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // @ts-ignore
        const modules = import.meta.glob('../content/*.md', { as: 'raw' }) as Record<string, () => Promise<string>>;
        const entries = Object.entries(modules);
        for (const [path, loader] of entries) {
          if (path.endsWith('skills.md')) {
            const txt = await loader();
            const parsed = parseSkillsText(txt);
            if (mounted) setSkills(parsed.length ? parsed : []);
            break;
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { skills, loading };
};

export const useWorkStatus = (): { status: WorkStatus; loading: boolean } => {
  const [status, setStatus] = useState<WorkStatus>('Currently Employed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // @ts-ignore
        const modules = import.meta.glob('../content/*.md', { as: 'raw' }) as Record<string, () => Promise<string>>;
        const entries = Object.entries(modules);
        for (const [path, loader] of entries) {
          if (path.endsWith('status.md')) {
            const txt = await loader();
            const parsed = parseStatusText(txt);
            if (mounted) setStatus(parsed);
            break;
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { status, loading };
};
