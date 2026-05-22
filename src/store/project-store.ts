import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedProject {
  id: string;
  lessonId: string;
  lessonTitle: string;
  code: string;
  output: string;
  screenshot: string | null;
  createdAt: string;
  approvedForSharing: boolean;
  shareId: string | null;
  sharedAt: string | null;
}

interface ProjectState {
  projects: SavedProject[];
  saveProject: (project: Omit<SavedProject, 'id' | 'createdAt' | 'approvedForSharing' | 'shareId' | 'sharedAt'>) => SavedProject;
  toggleShareApproval: (id: string) => void;
  revokeShare: (id: string) => void;
  deleteProject: (id: string) => void;
}

function createProjectId() {
  return `project_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createShareId(projectId: string) {
  return `${projectId.replace(/^project_/, 'p_')}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      saveProject: (project) => {
        const saved: SavedProject = {
          ...project,
          id: createProjectId(),
          createdAt: new Date().toISOString(),
          approvedForSharing: false,
          shareId: null,
          sharedAt: null,
        };

        set((state) => ({
          projects: [saved, ...state.projects.filter((item) => item.lessonId !== project.lessonId)].slice(0, 24),
        }));

        return saved;
      },
      toggleShareApproval: (id) =>
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== id) return project;
            const approvedForSharing = !project.approvedForSharing;
            return {
              ...project,
              approvedForSharing,
              shareId: approvedForSharing ? project.shareId || createShareId(project.id) : null,
              sharedAt: approvedForSharing ? project.sharedAt || new Date().toISOString() : null,
            };
          }),
        })),
      revokeShare: (id) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, approvedForSharing: false, shareId: null, sharedAt: null }
              : project
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),
    }),
    { name: 'pybuddy-projects', version: 1 }
  )
);

export function getLatestProjectForLesson(lessonId: string) {
  return useProjectStore.getState().projects.find((project) => project.lessonId === lessonId) || null;
}

export function getSharedProject(shareId: string) {
  return (
    useProjectStore
      .getState()
      .projects.find((project) => project.shareId === shareId && project.approvedForSharing) || null
  );
}
