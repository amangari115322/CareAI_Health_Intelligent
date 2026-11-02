"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Question,
  Answer,
  TechCategory,
  TechItem,
  DiagramData,
  SetupStep,
  BlueprintSpec,
  ProjectState,
} from "./api";

export type BuildStep =
  | "idea"
  | "requirements"
  | "tech_selection"
  | "architecture"
  | "blueprint_review"
  | "generating"
  | "ready";

export interface AgentStatus {
  agent: string;
  status: "pending" | "running" | "done" | "error";
  message: string;
}

interface ProjectStore {
  // Persistence status
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;

  // Project core
  projectId: string | null;
  idea: string;
  step: BuildStep;

  // Requirements & Q&A
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];

  // Tech Stack & Customization
  categories: TechCategory[];
  selectedTechnologies: string[];

  // Visual Diagrams & Blueprint
  diagrams: { architecture: DiagramData; workflow: DiagramData; dataflow: DiagramData } | null;
  blueprintSpec: BlueprintSpec | null;
  setupSteps: SetupStep[];

  // Agent statuses for live tracking
  agentStatuses: AgentStatus[];

  // Actions
  setIdea: (idea: string) => void;
  setProjectId: (id: string) => void;
  setQuestions: (questions: Question[]) => void;
  advanceQuestion: (answer: Answer) => void;
  setStep: (step: BuildStep) => void;
  setCategories: (categories: TechCategory[]) => void;
  setSelectedTechnologies: (techs: string[]) => void;
  toggleTechnology: (categoryId: string, techName: string) => void;
  addCustomTechnology: (categoryId: string, name: string) => void;
  setDiagrams: (diagrams: ProjectStore["diagrams"]) => void;
  setBlueprintSpec: (spec: BlueprintSpec | null) => void;
  setSetupSteps: (steps: SetupStep[]) => void;
  updateAgentStatus: (status: AgentStatus) => void;
  loadProjectState: (project: ProjectState) => void;
  reset: () => void;
}

const initialState = {
  isHydrated: false,
  projectId: null,
  idea: "",
  step: "idea" as BuildStep,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  categories: [],
  selectedTechnologies: [],
  diagrams: null,
  blueprintSpec: null,
  setupSteps: [],
  agentStatuses: [],
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      ...initialState,

      setIsHydrated: (isHydrated) => set({ isHydrated }),
      setIdea: (idea) => set({ idea }),
      setProjectId: (projectId) => set({ projectId }),
      setQuestions: (questions) => set({ questions, step: "requirements", currentQuestionIndex: 0, answers: [] }),

      advanceQuestion: (answer) =>
        set((state) => {
          const answers = [...state.answers, answer];
          const next = state.currentQuestionIndex + 1;
          const done = next >= state.questions.length;
          return {
            answers,
            currentQuestionIndex: done ? state.currentQuestionIndex : next,
            step: done ? "tech_selection" : "requirements",
          };
        }),

      setStep: (step) => set({ step }),

      setCategories: (categories) => {
        const selected: string[] = [];
        categories.forEach((cat) => {
          cat.items.forEach((item) => {
            if (item.selected) selected.push(item.name);
          });
        });
        set({ categories, selectedTechnologies: selected });
      },

      setSelectedTechnologies: (selectedTechnologies) => set({ selectedTechnologies }),

      toggleTechnology: (categoryId, techName) =>
        set((state) => {
          const updatedCategories = state.categories.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              items: cat.items.map((item) => {
                if (item.name.toLowerCase() === techName.toLowerCase()) {
                  return { ...item, selected: !item.selected };
                }
                return item;
              }),
            };
          });

          const newSelected: string[] = [];
          updatedCategories.forEach((cat) => {
            cat.items.forEach((item) => {
              if (item.selected) newSelected.push(item.name);
            });
          });

          return { categories: updatedCategories, selectedTechnologies: newSelected };
        }),

      addCustomTechnology: (categoryId, name) =>
        set((state) => {
          if (!name.trim()) return state;
          const customItem: TechItem = {
            id: `custom_${Date.now()}`,
            name: name.trim(),
            category: categoryId,
            description: "Custom user-added technology",
            icon: "✨",
            recommended: false,
            selected: true,
            tag: "Custom",
          };

          const updatedCategories = state.categories.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              items: [...cat.items, customItem],
            };
          });

          const newSelected = [...state.selectedTechnologies, name.trim()];
          return { categories: updatedCategories, selectedTechnologies: newSelected };
        }),

      setDiagrams: (diagrams) => set({ diagrams }),
      setBlueprintSpec: (blueprintSpec) => set({ blueprintSpec }),
      setSetupSteps: (setupSteps) => set({ setupSteps }),

      updateAgentStatus: (newStatus) =>
        set((state) => {
          const existing = state.agentStatuses.find((s) => s.agent === newStatus.agent);
          if (existing) {
            return {
              agentStatuses: state.agentStatuses.map((s) =>
                s.agent === newStatus.agent ? newStatus : s
              ),
            };
          }
          return { agentStatuses: [...state.agentStatuses, newStatus] };
        }),

      loadProjectState: (proj: ProjectState) => {
        let step: BuildStep = "idea";
        if (proj.status === "done") {
          step = "ready";
        } else if (proj.status === "generating") {
          step = "generating";
        } else if (proj.blueprint_spec && proj.diagrams && Object.keys(proj.diagrams).length > 0) {
          step = "blueprint_review";
        } else if (proj.technologies && proj.technologies.length > 0) {
          step = "tech_selection";
        } else if (proj.questions && proj.questions.length > 0) {
          step = (proj.current_question_index >= proj.questions.length) ? "tech_selection" : "requirements";
        }

        const selected: string[] = [];
        if (proj.technologies) {
          proj.technologies.forEach((cat) => {
            cat.items?.forEach((item) => {
              if (item.selected) selected.push(item.name);
            });
          });
        }

        set({
          projectId: proj.id,
          idea: proj.idea || "",
          step,
          questions: proj.questions || [],
          currentQuestionIndex: proj.current_question_index || (proj.answers?.length ?? 0),
          answers: proj.answers || [],
          categories: proj.technologies || [],
          selectedTechnologies: selected,
          diagrams: proj.diagrams || null,
          blueprintSpec: proj.blueprint_spec || null,
          setupSteps: proj.setup_steps || [],
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: "blueprintai-project-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      onRehydrateStorage: () => (state) => {
        state?.setIsHydrated(true);
      },
    }
  )
);
