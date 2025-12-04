import reducer, {
  createList,
  deleteList,
  fetchLists,
  fetchSharedLists,
  resetListsState,
  selectListById,
  selectLists,
  selectListsError,
  selectListsLoading,
  selectOwnedLists,
  selectSelectedList,
  selectSelectedListId,
  selectSharedLists,
  setError,
  setLoading,
  setSelectedList,
  shareList,
  unshareList,
  updateList,
  updateListSharePermission,
} from "@/store/slices/listsSlice";
import type { List, ListShare, ListsState } from "@/types/tasks-system/list";
import { describe, expect, it } from "vitest";

const baseList: List = {
  id: "l1",
  name: "Inbox",
  description: "default",
  createdAt: "2024-01-01",
  tasks: [],
  ownerId: "owner-1",
  shares: [],
};

const share: ListShare = {
  id: "share-1",
  permission: "VIEW",
  listId: "l1",
  userId: "user-1",
};

const initialState: ListsState = {
  lists: [],
  selectedListId: null,
  isLoading: false,
  error: null,
};

describe("listsSlice reducer", () => {
  it("setLoading y setError actualizan flags", () => {
    let state = reducer(initialState, setLoading(true));
    expect(state.isLoading).toBe(true);

    state = reducer(state, setError("oops"));
    expect(state.error).toBe("oops");
    expect(state.isLoading).toBe(false);
  });

  it("fetchLists.fulfilled reemplaza y limpia estado", () => {
    const action = {
      type: fetchLists.fulfilled.type,
      payload: [baseList],
    };
    const state = reducer(
      { ...initialState, error: "err", isLoading: true },
      action,
    );
    expect(state.lists).toEqual([baseList]);
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("createList.fulfilled inserta al inicio y limpia error", () => {
    const another = { ...baseList, id: "l2", name: "Work" };
    const action = {
      type: createList.fulfilled.type,
      payload: baseList,
    };
    const state = reducer(
      { ...initialState, lists: [another], error: "x" },
      action,
    );
    expect(state.lists.map((l) => l.id)).toEqual(["l1", "l2"]);
    expect(state.error).toBeNull();
  });

  it("updateList.fulfilled modifica la lista encontrada", () => {
    const action = {
      type: updateList.fulfilled.type,
      payload: { ...baseList, name: "Updated" },
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].name).toBe("Updated");
  });

  it("updateList.fulfilled no modifica si no encuentra la lista", () => {
    const action = {
      type: updateList.fulfilled.type,
      payload: { ...baseList, id: "not-found", name: "Updated" },
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].name).toBe("Inbox");
  });

  it("deleteList.fulfilled elimina y limpia selectedListId", () => {
    const populated: ListsState = {
      ...initialState,
      lists: [baseList],
      selectedListId: "l1",
    };
    const action = {
      type: deleteList.fulfilled.type,
      payload: "l1",
    };
    const state = reducer(populated, action);
    expect(state.lists).toHaveLength(0);
    expect(state.selectedListId).toBeNull();
  });

  it("deleteList.fulfilled elimina pero mantiene selectedListId diferente", () => {
    const otherList = { ...baseList, id: "l2", name: "Other" };
    const populated: ListsState = {
      ...initialState,
      lists: [baseList, otherList],
      selectedListId: "l2",
    };
    const action = {
      type: deleteList.fulfilled.type,
      payload: "l1",
    };
    const state = reducer(populated, action);
    expect(state.lists).toHaveLength(1);
    expect(state.lists[0].id).toBe("l2");
    expect(state.selectedListId).toBe("l2");
  });

  it("setSelectedList guarda el id", () => {
    const state = reducer(initialState, setSelectedList("l1"));
    expect(state.selectedListId).toBe("l1");
  });

  it("resetListsState vuelve al estado inicial", () => {
    const dirty: ListsState = {
      lists: [baseList],
      selectedListId: "l1",
      isLoading: true,
      error: "x",
    };
    const state = reducer(dirty, resetListsState());
    expect(state).toEqual(initialState);
  });
});

describe("listsSlice selectors", () => {
  const wrap = (lists: ListsState) => ({ lists });

  it("selectLists y selectSelectedList", () => {
    const state = wrap({
      ...initialState,
      lists: [baseList],
      selectedListId: "l1",
    });
    expect(selectLists(state)).toEqual([baseList]);
    expect(selectSelectedList(state)).toEqual(baseList);
  });

  it("selectListById retorna coincidencia", () => {
    const state = wrap({
      ...initialState,
      lists: [baseList, { ...baseList, id: "l2" }],
    });
    expect(selectListById("l2")(state)?.id).toBe("l2");
  });

  it("selectOwnedLists filtra por ownerId", () => {
    const state = wrap({
      ...initialState,
      lists: [baseList, { ...baseList, id: "l2", ownerId: "owner-2" }],
    });
    expect(selectOwnedLists("owner-1")(state)).toHaveLength(1);
    expect(selectOwnedLists("owner-2")(state)).toHaveLength(1);
  });

  it("selectSharedLists devuelve listas con share del usuario", () => {
    const sharedList: List = {
      ...baseList,
      id: "l3",
      shares: [share],
    };
    const state = wrap({
      ...initialState,
      lists: [baseList, sharedList],
    });
    expect(selectSharedLists("user-1")(state)).toEqual([sharedList]);
    expect(selectSharedLists("other")(state)).toEqual([]);
  });

  it("selectListsLoading retorna estado de carga", () => {
    const state = wrap({ ...initialState, isLoading: true });
    expect(selectListsLoading(state)).toBe(true);
  });

  it("selectListsError retorna error", () => {
    const state = wrap({ ...initialState, error: "Error de prueba" });
    expect(selectListsError(state)).toBe("Error de prueba");
  });

  it("selectSelectedListId retorna ID seleccionado", () => {
    const state = wrap({ ...initialState, selectedListId: "l1" });
    expect(selectSelectedListId(state)).toBe("l1");
  });
});

describe("listsSlice - Acciones asíncronas adicionales", () => {
  it("fetchSharedLists.fulfilled reemplaza las listas", () => {
    const sharedList = { ...baseList, id: "l-shared" };
    const action = {
      type: fetchSharedLists.fulfilled.type,
      payload: [sharedList],
    };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.lists).toEqual([sharedList]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetchSharedLists.rejected establece error", () => {
    const action = {
      type: fetchSharedLists.rejected.type,
      payload: "Error al cargar listas compartidas",
    };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.error).toBe("Error al cargar listas compartidas");
    expect(state.isLoading).toBe(false);
  });

  it("shareList.fulfilled actualiza la lista con shares", () => {
    const updatedList = {
      ...baseList,
      shares: [share],
    };
    const action = {
      type: shareList.fulfilled.type,
      payload: updatedList,
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].shares).toEqual([share]);
    expect(state.error).toBeNull();
  });

  it("shareList.fulfilled no actualiza si no encuentra la lista", () => {
    const updatedList = {
      ...baseList,
      id: "not-found",
      shares: [share],
    };
    const action = {
      type: shareList.fulfilled.type,
      payload: updatedList,
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].shares).toEqual([]);
  });

  it("shareList.rejected establece error", () => {
    const action = {
      type: shareList.rejected.type,
      payload: "Error al compartir lista",
    };
    const state = reducer(initialState, action);
    expect(state.error).toBe("Error al compartir lista");
  });

  it("updateListSharePermission.pending actualiza optimísticamente", () => {
    const listWithShare = {
      ...baseList,
      shares: [{ ...share, permission: "VIEW" as const }],
    };
    const action = {
      type: updateListSharePermission.pending.type,
      meta: {
        arg: { listId: "l1", userId: "user-1", permission: "EDIT" },
      },
    };
    const state = reducer({ ...initialState, lists: [listWithShare] }, action);
    expect(state.lists[0].shares?.[0].permission).toBe("EDIT");
  });

  it("updateListSharePermission.pending no hace nada si no encuentra la lista", () => {
    const action = {
      type: updateListSharePermission.pending.type,
      meta: {
        arg: { listId: "not-found", userId: "user-1", permission: "EDIT" },
      },
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].shares).toEqual([]);
  });

  it("updateListSharePermission.pending no hace nada si la lista no tiene shares", () => {
    const action = {
      type: updateListSharePermission.pending.type,
      meta: {
        arg: { listId: "l1", userId: "user-1", permission: "EDIT" },
      },
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].shares).toEqual([]);
  });

  it("updateListSharePermission.pending no hace nada si no encuentra el share", () => {
    const listWithShare = {
      ...baseList,
      shares: [{ ...share, userId: "other-user" }],
    };
    const action = {
      type: updateListSharePermission.pending.type,
      meta: {
        arg: { listId: "l1", userId: "user-1", permission: "EDIT" },
      },
    };
    const state = reducer({ ...initialState, lists: [listWithShare] }, action);
    expect(state.lists[0].shares?.[0].userId).toBe("other-user");
  });

  it("updateListSharePermission.fulfilled actualiza la lista", () => {
    const updatedList = {
      ...baseList,
      shares: [{ ...share, permission: "EDIT" as const }],
    };
    const action = {
      type: updateListSharePermission.fulfilled.type,
      payload: updatedList,
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].shares?.[0].permission).toBe("EDIT");
  });

  it("updateListSharePermission.fulfilled no actualiza si no encuentra la lista", () => {
    const updatedList = {
      ...baseList,
      id: "not-found",
      shares: [{ ...share, permission: "EDIT" as const }],
    };
    const action = {
      type: updateListSharePermission.fulfilled.type,
      payload: updatedList,
    };
    const state = reducer({ ...initialState, lists: [baseList] }, action);
    expect(state.lists[0].shares).toEqual([]);
  });

  it("updateListSharePermission.rejected establece error", () => {
    const action = {
      type: updateListSharePermission.rejected.type,
      payload: "Error al actualizar permisos",
    };
    const state = reducer(initialState, action);
    expect(state.error).toBe("Error al actualizar permisos");
  });

  it("unshareList.fulfilled elimina el share de la lista", () => {
    const listWithoutShare = { ...baseList, shares: [] };
    const action = {
      type: unshareList.fulfilled.type,
      payload: listWithoutShare,
    };
    const state = reducer(
      { ...initialState, lists: [{ ...baseList, shares: [share] }] },
      action,
    );
    expect(state.lists[0].shares).toEqual([]);
  });

  it("unshareList.fulfilled no actualiza si no encuentra la lista", () => {
    const listWithoutShare = { ...baseList, id: "not-found", shares: [] };
    const action = {
      type: unshareList.fulfilled.type,
      payload: listWithoutShare,
    };
    const state = reducer(
      { ...initialState, lists: [{ ...baseList, shares: [share] }] },
      action,
    );
    expect(state.lists[0].shares).toEqual([share]);
  });

  it("unshareList.rejected establece error", () => {
    const action = {
      type: unshareList.rejected.type,
      payload: "Error al dejar de compartir",
    };
    const state = reducer(initialState, action);
    expect(state.error).toBe("Error al dejar de compartir");
  });

  it("fetchLists.pending establece isLoading", () => {
    const action = { type: fetchLists.pending.type };
    const state = reducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("fetchLists.rejected establece error", () => {
    const action = {
      type: fetchLists.rejected.type,
      payload: "Error de red",
    };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.error).toBe("Error de red");
    expect(state.isLoading).toBe(false);
  });

  it("createList.pending establece isLoading", () => {
    const action = { type: createList.pending.type };
    const state = reducer(initialState, action);
    expect(state.isLoading).toBe(true);
  });

  it("createList.rejected establece error", () => {
    const action = {
      type: createList.rejected.type,
      payload: "Error al crear lista",
    };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.error).toBe("Error al crear lista");
    expect(state.isLoading).toBe(false);
  });

  it("updateList.pending establece isLoading", () => {
    const action = { type: updateList.pending.type };
    const state = reducer(initialState, action);
    expect(state.isLoading).toBe(true);
  });

  it("updateList.rejected establece error", () => {
    const action = {
      type: updateList.rejected.type,
      payload: "Error al actualizar",
    };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.error).toBe("Error al actualizar");
    expect(state.isLoading).toBe(false);
  });

  it("deleteList.pending establece isLoading", () => {
    const action = { type: deleteList.pending.type };
    const state = reducer(initialState, action);
    expect(state.isLoading).toBe(true);
  });

  it("deleteList.rejected establece error", () => {
    const action = {
      type: deleteList.rejected.type,
      payload: "Error al eliminar",
    };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.error).toBe("Error al eliminar");
    expect(state.isLoading).toBe(false);
  });

  it("fetchSharedLists.pending establece isLoading", () => {
    const action = { type: fetchSharedLists.pending.type };
    const state = reducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("shareList.pending limpia error", () => {
    const action = { type: shareList.pending.type };
    const state = reducer({ ...initialState, error: "old error" }, action);
    expect(state.error).toBeNull();
  });

  it("unshareList.pending limpia error", () => {
    const action = { type: unshareList.pending.type };
    const state = reducer({ ...initialState, error: "old error" }, action);
    expect(state.error).toBeNull();
  });
});
