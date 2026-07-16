import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.stubEnv("VITE_API_BASE_URL", "http://localhost/backend/api");

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
