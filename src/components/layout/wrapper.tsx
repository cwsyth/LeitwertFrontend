import Header from "./header";
import Footer from "./footer";

interface WrapperProps {
  children: React.ReactNode;
}

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div className="h-full flex flex-col bg-stone-900">
      <Header />
      <main className="flex-1 flex items-center justify-center overflow-auto">
        <div className="h-full w-full max-w-[var(--content-max-width)]">
            {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
