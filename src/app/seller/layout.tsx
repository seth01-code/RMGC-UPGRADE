// app/seller/layout.tsx
import SellerNavbar from "./components/navbar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SellerNavbar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}