import {
  isListOwner,
  canAccessList,
  selectAccessibleLists,
  selectAccessibleTasks,
} from "@/store/slices/permissionsSelectors";
import type { RootState } from "@/store/store";
import { describe, expect, it } from "vitest";

describe("permissionsSelectors", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
  };

  const mockLists = [
    {
      id: "list-1",
      name: "Own List",
      ownerId: "user-1",
      userId: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "list-2",
      name: "Shared List",
      ownerId: "user-2",
      userId: "user-2",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [{ userId: "user-1", permission: "VIEW" as const }],
    },
    {
      id: "list-3",
      name: "Other List",
      ownerId: "user-3",
      userId: "user-3",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "list-4",
      name: "Edit Shared",
      ownerId: "user-2",
      userId: "user-2",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [{ userId: "user-1", permission: "EDIT" as const }],
    },
  ];

  const mockTasks = [
    {
      id: "task-1",
      title: "Task 1",
      listId: "list-1",
      userId: "user-1",
      status: "PENDING",
      priority: "HIGH",
      favorite: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "task-2",
      title: "Task 2",
      listId: "list-2",
      userId: "user-2",
      status: "PENDING",
      priority: "LOW",
      favorite: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [],
    },
    {
      id: "task-3",
      title: "Task 3",
      listId: "list-3",
      userId: "user-3",
      status: "COMPLETED",
      priority: "MEDIUM",
      favorite: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      shares: [{ userId: "user-1", permission: "VIEW" as const }],
    },
  ];

  const createState = (
    user: typeof mockUser | null = mockUser,
    lists = mockLists,
    tasks = mockTasks,
  ): RootState =>
    ({
      auth: {
        user,
        token: user ? "token" : null,
        isAuthenticated: !!user,
        isLoading: false,
        error: null,
        isInitializing: false,
      },
      lists: {
        lists,
        isLoading: false,
        error: null,
        selectedListId: null,
      },
      tasks: {
        tasks,
        isLoading: false,
        error: null,
        filters: {
          status: "all",
          listId: null,
          priority: "all",
          favorite: "all",
        },
        sorting: {
          field: "createdAt",
          order: "desc",
        },
      },
      theme: { mode: "light" },
      notifications: { notifications: [], isLoading: false, error: null },
      ui: { sidebarOpen: true },
    }) as RootState;

  describe("isListOwner", () => {
    it("returns true for owned list", () => {
      const state = createState();
      expect(isListOwner("list-1")(state)).toBe(true);
    });

    it("returns false for non-owned list", () => {
      const state = createState();
      expect(isListOwner("list-2")(state)).toBe(false);
    });

    it("returns false when user is null", () => {
      const state = createState(null);
      expect(isListOwner("list-1")(state)).toBe(false);
    });

    it("returns false for non-existent list", () => {
      const state = createState();
      expect(isListOwner("non-existent")(state)).toBe(false);
    });
  });

  describe("canAccessList", () => {
    it("returns true for owned list with VIEW permission", () => {
      const state = createState();
      expect(canAccessList("list-1", "VIEW")(state)).toBe(true);
    });

    it("returns true for owned list with EDIT permission", () => {
      const state = createState();
      expect(canAccessList("list-1", "EDIT")(state)).toBe(true);
    });

    it("returns true for owned list with ADMIN permission", () => {
      const state = createState();
      expect(canAccessList("list-1", "ADMIN")(state)).toBe(true);
    });

    it("returns true for shared list with VIEW permission", () => {
      const state = createState();
      expect(canAccessList("list-2", "VIEW")(state)).toBe(true);
    });

    it("returns false for shared VIEW list requesting EDIT", () => {
      const state = createState();
      expect(canAccessList("list-2", "EDIT")(state)).toBe(false);
    });

    it("returns true for shared EDIT list requesting VIEW", () => {
      const state = createState();
      expect(canAccessList("list-4", "VIEW")(state)).toBe(true);
    });

    it("returns true for shared EDIT list requesting EDIT", () => {
      const state = createState();
      expect(canAccessList("list-4", "EDIT")(state)).toBe(true);
    });

    it("returns false for non-accessible list", () => {
      const state = createState();
      expect(canAccessList("list-3", "VIEW")(state)).toBe(false);
    });

    it("returns false when user is null", () => {
      const state = createState(null);
      expect(canAccessList("list-1", "VIEW")(state)).toBe(false);
    });

    it("defaults to VIEW permission", () => {
      const state = createState();
      expect(canAccessList("list-2")(state)).toBe(true);
    });
  });

  describe("selectAccessibleLists", () => {
    it("returns owned and shared lists", () => {
      const state = createState();
      const accessible = selectAccessibleLists(state);

      expect(accessible).toHaveLength(3);
      expect(accessible.map((l) => l.id)).toContain("list-1");
      expect(accessible.map((l) => l.id)).toContain("list-2");
      expect(accessible.map((l) => l.id)).toContain("list-4");
    });

    it("returns empty array when user is null", () => {
      const state = createState(null);
      const accessible = selectAccessibleLists(state);

      expect(accessible).toEqual([]);
    });

    it("excludes non-accessible lists", () => {
      const state = createState();
      const accessible = selectAccessibleLists(state);

      expect(accessible.map((l) => l.id)).not.toContain("list-3");
    });
  });

  describe("selectAccessibleTasks", () => {
    it("returns tasks from owned lists", () => {
      const state = createState();
      const accessible = selectAccessibleTasks(state);

      expect(accessible.map((t) => t.id)).toContain("task-1");
    });

    it("returns tasks from shared lists", () => {
      const state = createState();
      const accessible = selectAccessibleTasks(state);

      expect(accessible.map((t) => t.id)).toContain("task-2");
    });

    it("returns tasks with direct share", () => {
      const state = createState();
      const accessible = selectAccessibleTasks(state);

      expect(accessible.map((t) => t.id)).toContain("task-3");
    });

    it("returns empty array when user is null", () => {
      const state = createState(null);
      const accessible = selectAccessibleTasks(state);

      expect(accessible).toEqual([]);
    });

    it("filters out tasks from non-existent lists", () => {
      const tasksWithOrphan = [
        ...mockTasks,
        {
          id: "task-orphan",
          title: "Orphan Task",
          listId: "non-existent",
          userId: "user-1",
          status: "PENDING",
          priority: "LOW",
          favorite: false,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          shares: [],
        },
      ];
      const state = createState(mockUser, mockLists, tasksWithOrphan);
      const accessible = selectAccessibleTasks(state);

      expect(accessible.map((t) => t.id)).not.toContain("task-orphan");
    });
  });
});
