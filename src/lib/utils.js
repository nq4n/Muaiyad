export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function getCurrentYear() {
  return new Date().getFullYear();
}
