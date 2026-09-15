export function protectedDestination(isLoading: boolean, isAuthenticated: boolean): "loading" | "allow" | "/login" {
  if (isLoading) return "loading";
  return isAuthenticated ? "allow" : "/login";
}

