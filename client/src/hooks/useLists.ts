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
  setLoading,
  setError,
} from "@/store/slices/listsSlice";
import { selectUser } from "@/store/slices/authSlice";
import {
  selectAccessibleLists,
  getListPermission,
  canAccessList,
  isListOwner,
} from "@/store/slices/permissionsSelectors";
import type { List, ListShare } from "@/types/tasks-system/list";
import type { SharePermission } from "@/types/permissions";

export function useLists() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const lists = useAppSelector(selectLists);
  const isLoading = useAppSelector(selectListsLoading);
  const error = useAppSelector(selectListsError);
  const selectedListId = useAppSelector(selectSelectedListId);
  const selectedList = useAppSelector(selectSelectedList);

  const accessibleLists = useAppSelector(selectAccessibleLists);
  const ownedLists = useAppSelector(selectOwnedLists(user?.id || ""));
  const sharedLists = useAppSelector(selectSharedLists(user?.id || ""));

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

  const setLoadingState = (loading: boolean) => dispatch(setLoading(loading));
  const setErrorState = (error: string | null) => dispatch(setError(error));

  const state = useAppSelector((state) => state);

  const getPermission = (listId: string): SharePermission | null =>
    getListPermission(listId)(state);
  const canAccess = (
    listId: string,
    permission: SharePermission = "VIEW",
  ): boolean => canAccessList(listId, permission)(state);
  const isOwner = (listId: string): boolean => isListOwner(listId)(state);

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
    setLoadingState,
    setErrorState,
    getPermission,
    canAccess,
    isOwner,
  };
}
