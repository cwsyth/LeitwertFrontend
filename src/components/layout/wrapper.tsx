import Header from "./header";
import Footer from "./footer";

interface WrapperProps {
  children: React.ReactNode;
}

export default function Wrapper({ children }: WrapperProps) {
  return (
    <div className="flex flex-col bg-stone-900 h-full ">
      <div className="overflow-auto">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[var(--content-max-width)]">
                {children}
            </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
