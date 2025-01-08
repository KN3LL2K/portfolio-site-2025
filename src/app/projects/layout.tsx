import React from "react";
import BackLink from "../components/BackLink";
import { Waves } from "lucide-react";
import Footer from "../components/Footer";

export default function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid grid-rows-[60px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="w-full lg:px-16 max-w-5xl">
        <div className="flex flex-col gap-6 justify-self-start">
          <div className="flex items-center gap-3 text-blue-600">
            <Waves size={40} />{" "}
            <span className="text-gray-700 text-xl font-bold">
              Harry Bellenie
            </span>
          </div>
          <BackLink />
        </div>
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-start justify-items-center max-w-5xl">
        {children}
      </main>
        <Footer />
    </div>
  );
}
