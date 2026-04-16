import LayoutShell from "./LayoutShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
