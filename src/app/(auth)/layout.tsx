import { Navbar } from "@/src/components/layout/Navbar";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-56px)]">
        {children}
      </div>
    </>
  );
}