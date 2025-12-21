import Header from "./header";
import Footer from "./footer";

interface WrapperProps {
  children: React.ReactNode;
}

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div className="flex flex-col bg-stone-900 h-full">
      <div className="h-[100vh] max-h-[100vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 mb-4">
            <Header />
        </div>
        <main className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-[var(--content-max-width)] h-full">
                {children}
            </div>
        </main>
        <div className="flex-shrink-0 m-4">
            <Footer />
        </div>
      </div>
    </div>
  );
}
