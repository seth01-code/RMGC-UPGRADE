import SellerNavbar from "../seller/components/navbar";
import LayoutShell from "../seller/components/LayoutShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SellerNavbar />
      <LayoutShell>{children}</LayoutShell>
    </div>
  );
}