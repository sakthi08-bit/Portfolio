import { useEffect } from 'react';
import { ProjectItem } from '../data/portfolio';
import { ProjectArt } from './ProjectArt';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      data-lenis-prevent=""
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="proj-modal-title">
        <div className="modal-card__head">
          <span className="mono">Project {project.num}</span>
          <button type="button" className="modal-card__close" onClick={onClose}>
            Close ✕
          </button>
        </div>

        <div className="rounded-lg bg-[var(--bg)] border border-[var(--line)] aspect-[16/8] grid place-items-center p-6 mb-6">
          <ProjectArt type={project.artType} />
        </div>

        <h3 id="proj-modal-title" className="text-3xl font-medium tracking-tight">
          {project.title}
        </h3>
        <p className="font-[family-name:var(--f-serif)] italic text-xl text-[var(--fg-2)] mt-1">
          {project.subtitle}
        </p>

        <p className="text-[var(--fg-2)] mt-4 leading-relaxed">{project.description}</p>

        <div className="mt-6 pt-5 border-t border-[var(--line)]">
          <span className="mono block mb-3">Technical Highlights</span>
          <ul className="exp__bullets">
            {project.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--line)]">
          <ul className="meta-tags">
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn text-sm py-2.5 px-5"
          >
            <span>Explore on GitHub</span>
            <span className="btn__arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
