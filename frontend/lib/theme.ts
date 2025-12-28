export type Theme = "bright" | "dark";

export function applyTheme(next: Theme) {
  if (typeof document === "undefined") return;
  // remove any theme classes we may have used historically
  document.documentElement.classList.remove("bright", "dark", "light");

  // For compatibility, treat `bright` as equivalent to `light` (some CSS uses .light)
  if (next === "bright") {
    document.documentElement.classList.add("bright");
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.add("dark");
  }

  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (meta) meta.setAttribute("content", next === "dark" ? "#020617" : "#f8fafc");
  window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
}

export function toggleTheme() {
  if (typeof document === "undefined") return;
  // consider either 'bright' or legacy 'light' as the bright state
  const isBright = document.documentElement.classList.contains("bright") || document.documentElement.classList.contains("light");
  const current = isBright ? "bright" : "dark";
  const next: Theme = current === "dark" ? "bright" : "dark";
  applyTheme(next);
  return next;
}
