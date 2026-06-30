import SellerNavbar from "./components/navbar";
import LayoutShell from "./components/LayoutShell";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SellerNavbar />
      <LayoutShell>{children}</LayoutShell>
    </div>
  );
}