import AuthGuard from "@/components/auth/AuthGuard";
import LayoutShell from "./LayoutShell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <LayoutShell>{children}</LayoutShell>
    </AuthGuard>
  );
}
