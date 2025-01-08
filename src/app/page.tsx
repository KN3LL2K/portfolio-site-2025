"use client";
import { Waves } from "lucide-react";
import BentoCard from "./components/BentoCard";
// import Canvas from "./components/Canvas";
import Footer from "./components/Footer";
import dynamic from 'next/dynamic'

const Canvas = dynamic(
  () => import('./components/Canvas'),
  { ssr: false }
)

export default function Home() {
  return (
    <div className="grid grid-rows-1 items-center justify-items-center min-h-screen p-8 pb-16 gap-16 sm:p-16">
      <main className="flex flex-col gap-8 row-start-2 items-start md:items-center justify-items-center max-w-5xl">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex flex-col gap-6">
            <div className="flex md:hidden text-blue-600">
              <Waves size={48} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl leading-[0.95] font-bold lg:text-6xl text-slate-700">
              I&apos;m Harry
              <br /> — Designer
              <br /> &amp; Developer
            </h1>
            <div className="max-w-[500px]">
              <p className="text-lg text-left text-slate-500">
                I&apos;m passionate about the intersection of art &amp;
                technology, and using my skills in both to create products that
                are a joy to use.
                {/* When I&apos;m not working you can find me
                making art, music, or playing video games. */}
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-col md:items-end shrink-0 h-full gap-2">
            <div className="hidden lg:flex flex-1 lg:pb-6 w-full justify-self-start">
              <Canvas />
            </div>
            <div className="hidden md:flex lg:hidden flex-1 justify-self-start text-blue-600">
              <Waves size={64} />
            </div>
            <p className="md:text-end">
              <span className="text-slate-400">Working Remotely from</span>
              <br /> Foster City, CA
            </p>
          </div>
        </section>
        <section id="work" className="grid grid-cols-1 w-full">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:grid-rows-2">
            <BentoCard
              href="/projects/confident-lims"
              title="Confident LIMS"
              overline="WORK"
              description="Laboratory Information Management System."
              size={4}
            />
            <BentoCard
              href="/projects/confident-connect"
              title="Connect"
              overline="WORK"
              description="A WebGL 3D data-viz tool."
            />
            <BentoCard
              href="/projects/wonderwall"
              title="Wonderwall"
              overline="PLAY"
              description="A workplace productivity tool."
            />
            <BentoCard
              href="/projects/gen-art"
              title="Flow Fields"
              overline="PLAY"
              description="Generative art."
            />
            <BentoCard
              href="/projects/lander"
              title="Lander"
              overline="PLAY"
              description="A WebGL 'lunar-lander' style game."
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
