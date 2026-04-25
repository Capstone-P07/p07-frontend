import AuthGuard from "@/components/AuthGuard";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopNav from "@/components/layout/AdminTopNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // <AuthGuard> 개발동안 잠시 꺼두겠음
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminTopNav />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    // </AuthGuard>
  );
}
