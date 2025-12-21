import Header from "./header";
import Footer from "./footer";

interface WrapperProps {
  children: React.ReactNode;
}

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div className="flex flex-col bg-stone-900 h-full">
      <div className="h-[100vh] overflow-auto">
        <div className="mb-4">
            <Header />
        </div>
        <main className="flex items-center justify-center h-[90vh]">
            <div className="w-full max-w-[var(--content-max-width)] h-full">
                {children}
            </div>
        </main>
        <div className="m-4">
            <Footer />
        </div>
      </div>
    </div>
  );
}
