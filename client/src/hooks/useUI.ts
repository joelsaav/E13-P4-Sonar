import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  selectSidebarWidth,
  selectTaskCardSize,
  setSidebarWidth as setSidebarWidthAction,
  setTaskCardSize as setTaskCardSizeAction,
  SidebarWidth,
  TaskCardSize,
} from "@/store/slices/uiSlice";

export function useUI() {
  const dispatch = useAppDispatch();
  const sidebarWidth = useAppSelector(selectSidebarWidth);
  const taskCardSize = useAppSelector(selectTaskCardSize);

  const setSidebarWidth = (width: SidebarWidth) => {
    dispatch(setSidebarWidthAction(width));
  };

  const setTaskCardSize = (size: TaskCardSize) => {
    dispatch(setTaskCardSizeAction(size));
  };

  return { sidebarWidth, setSidebarWidth, taskCardSize, setTaskCardSize };
}
