import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePathname } from "@/hooks/usePathname";

describe("usePathname", () => {
  let originalLocation: Location;
  let mockLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    delete (window as any).location;
    mockLocation = {
      pathname: "/",
      href: "http://localhost/",
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      ancestorOrigins: {} as DOMStringList,
      origin: "http://localhost",
      protocol: "http:",
      host: "localhost",
      hostname: "localhost",
      port: "",
      hash: "",
      search: "",
    };
    window.location = mockLocation as Location;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  it("should return current pathname", () => {
    mockLocation.pathname = "/dashboard";
    const { result } = renderHook(() => usePathname());
    expect(result.current).toBe("/dashboard");
  });

  it("should update on popstate event", () => {
    mockLocation.pathname = "/";
    const { result } = renderHook(() => usePathname());

    expect(result.current).toBe("/");

    act(() => {
      mockLocation.pathname = "/settings";
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current).toBe("/settings");
  });

  it("should update on hashchange event", () => {
    mockLocation.pathname = "/";
    const { result } = renderHook(() => usePathname());

    expect(result.current).toBe("/");

    act(() => {
      mockLocation.pathname = "/contacts";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(result.current).toBe("/contacts");
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => usePathname());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "hashchange",
      expect.any(Function),
    );
  });
});
