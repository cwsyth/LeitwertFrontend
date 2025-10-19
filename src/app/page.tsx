import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="bg-black min-h-screen min-w-screen">
        <h1 className="text-3xl font-bold underline">
          Test Tailwind
        </h1>
        <div>
          <Button>Test shadcn Button</Button>
        </div>
    </div>
  );
}
