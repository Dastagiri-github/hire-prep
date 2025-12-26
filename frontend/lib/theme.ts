export type Theme = "light" | "dark";

export function applyTheme(next: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) {}
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (meta) meta.setAttribute("content", next === "dark" ? "#020617" : "#f8fafc");
  window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
}

export function toggleTheme() {
  if (typeof document === "undefined") return;
  const current = document.documentElement.classList.contains("light") ? "light" : "dark";
  const next: Theme = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
