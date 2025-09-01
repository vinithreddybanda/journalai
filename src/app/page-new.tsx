import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-4xl text-center">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to JournalAI
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl">
          Your AI-powered journaling companion. Get started by testing the shadcn/ui setup below.
        </p>

        <div className="flex gap-4">
          <Button variant="default" size="lg">
            Primary Button
          </Button>
          <Button variant="secondary" size="lg">
            Secondary Button
          </Button>
          <Button variant="outline" size="lg">
            Outline Button
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>✅ TailwindCSS v3 configured</p>
          <p>✅ shadcn/ui components working</p>
          <p>✅ CSS variables and theming setup</p>
        </div>
      </main>
    </div>
  );
}
