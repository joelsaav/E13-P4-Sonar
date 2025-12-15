import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  selectLists,
  selectListsLoading,
  selectListsError,
  selectSelectedListId,
  selectSelectedList,
  selectOwnedLists,
  selectSharedLists,
  fetchLists,
  fetchSharedLists,
  createList,
  updateList,
  deleteList,
  setSelectedList,
  shareList as shareListThunk,
  updateListSharePermission,
  unshareList,
} from "@/store/slices/listsSlice";
import { selectUser } from "@/store/slices/authSlice";
import {
  selectAccessibleLists,
  canAccessList,
  isListOwner,
} from "@/store/slices/permissionsSelectors";
import type { List, ListShare } from "@/types/tasks-system/list";
import type { SharePermission } from "@/types/permissions";
import { useCallback } from "react";
import { store } from "@/store/store";

export function useLists() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const lists = useAppSelector(selectLists);
  const isLoading = useAppSelector(selectListsLoading);
  const error = useAppSelector(selectListsError);
  const selectedListId = useAppSelector(selectSelectedListId);
  const selectedList = useAppSelector(selectSelectedList);

  const accessibleLists = useAppSelector(selectAccessibleLists);
  const ownedLists = useAppSelector((state) =>
    selectOwnedLists(state, user?.id || ""),
  );
  const sharedLists = useAppSelector((state) =>
    selectSharedLists(state, user?.id || ""),
  );

  const fetchAllLists = () => dispatch(fetchLists());
  const fetchSharedListsAction = () => dispatch(fetchSharedLists());
  const createNewList = (list: Partial<List>) => dispatch(createList(list));
  const editList = (data: Partial<List> & { id: string }) =>
    dispatch(updateList(data));
  const removeList = (id: string) => dispatch(deleteList(id));
  const selectList = (id: string | null) => dispatch(setSelectedList(id));

  const shareList = (listId: string, share: ListShare) =>
    dispatch(
      shareListThunk({
        listId,
        email: share.user?.email || "",
        permission: share.permission,
      }),
    );
  const updateShare = (listId: string, share: ListShare) =>
    dispatch(
      updateListSharePermission({
        listId,
        userId: share.userId,
        permission: share.permission,
      }),
    );
  const removeShare = (listId: string, shareId: string) =>
    dispatch(unshareList({ listId, userId: shareId }));

  const canAccess = useCallback(
    (listId: string, permission: SharePermission = "VIEW"): boolean =>
      canAccessList(listId, permission)(store.getState()),
    [],
  );
  const isOwner = useCallback(
    (listId: string): boolean => isListOwner(listId)(store.getState()),
    [],
  );

  return {
    lists,
    accessibleLists,
    ownedLists,
    sharedLists,
    isLoading,
    error,
    selectedListId,
    selectedList,
    fetchAllLists,
    fetchSharedLists: fetchSharedListsAction,
    createList: createNewList,
    editList,
    removeList,
    selectList,
    shareList,
    updateShare,
    removeShare,
    canAccess,
    isOwner,
  };
}
