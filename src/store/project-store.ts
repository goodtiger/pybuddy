import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_USER_ID } from '@/store/progress-store';

export interface SavedProject {
  id: string;
  userId: string;
  level: number;
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
  activeUserId: string;
  projectsByUser: Record<string, SavedProject[]>;
  selectUserProjects: (userId: string) => void;
  saveProject: (project: Omit<SavedProject, 'id' | 'userId' | 'createdAt' | 'approvedForSharing' | 'shareId' | 'sharedAt'>) => SavedProject;
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
      activeUserId: DEFAULT_USER_ID,
      projectsByUser: { [DEFAULT_USER_ID]: [] },
      selectUserProjects: (userId) =>
        set((state) => {
          const nextProjectsByUser = {
            ...state.projectsByUser,
            [state.activeUserId]: state.projects,
          };
          const selectedProjects = nextProjectsByUser[userId] || [];
          return {
            activeUserId: userId,
            projects: selectedProjects,
            projectsByUser: {
              ...nextProjectsByUser,
              [userId]: selectedProjects,
            },
          };
        }),
      saveProject: (project) => {
        const activeUserId = get().activeUserId;
        const saved: SavedProject = {
          ...project,
          userId: activeUserId,
          id: createProjectId(),
          createdAt: new Date().toISOString(),
          approvedForSharing: false,
          shareId: null,
          sharedAt: null,
        };

        set((state) => ({
          projects: [saved, ...state.projects.filter((item) => item.level !== project.level || item.lessonId !== project.lessonId)].slice(0, 24),
          projectsByUser: {
            ...state.projectsByUser,
            [state.activeUserId]: [saved, ...state.projects.filter((item) => item.level !== project.level || item.lessonId !== project.lessonId)].slice(0, 24),
          },
        }));

        return saved;
      },
      toggleShareApproval: (id) =>
        set((state) => {
          const projects = state.projects.map((project) => {
            if (project.id !== id) return project;
            const approvedForSharing = !project.approvedForSharing;
            return {
              ...project,
              approvedForSharing,
              shareId: approvedForSharing ? project.shareId || createShareId(project.id) : null,
              sharedAt: approvedForSharing ? project.sharedAt || new Date().toISOString() : null,
            };
          });
          return {
            projects,
            projectsByUser: { ...state.projectsByUser, [state.activeUserId]: projects },
          };
        }),
      revokeShare: (id) =>
        set((state) => {
          const projects = state.projects.map((project) =>
            project.id === id
              ? { ...project, approvedForSharing: false, shareId: null, sharedAt: null }
              : project
          );
          return {
            projects,
            projectsByUser: { ...state.projectsByUser, [state.activeUserId]: projects },
          };
        }),
      deleteProject: (id) =>
        set((state) => {
          const projects = state.projects.filter((project) => project.id !== id);
          return {
            projects,
            projectsByUser: { ...state.projectsByUser, [state.activeUserId]: projects },
          };
        }),
    }),
    {
      name: 'pybuddy-projects',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<ProjectState> | undefined;
        const activeUserId = state?.activeUserId || DEFAULT_USER_ID;
        const legacyProjects = (state?.projects || []).map((project) => ({
          ...project,
          userId: project.userId || activeUserId,
          level: project.level || 1,
        }));
        const projectsByUser = state?.projectsByUser || { [activeUserId]: legacyProjects };
        const projects = projectsByUser[activeUserId] || legacyProjects;

        return {
          activeUserId,
          projects,
          projectsByUser: {
            ...projectsByUser,
            [activeUserId]: projects,
          },
        };
      },
    }
  )
);

export function getLatestProjectForLesson(lessonId: string, level = 1) {
  return useProjectStore.getState().projects.find((project) => project.level === level && project.lessonId === lessonId) || null;
}

export function getSharedProject(shareId: string) {
  return (
    useProjectStore
      .getState()
      .projects.find((project) => project.shareId === shareId && project.approvedForSharing) || null
  );
}
