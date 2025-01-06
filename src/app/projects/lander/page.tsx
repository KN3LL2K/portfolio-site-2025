import ContentSection from "@/app/components/ContentSection";
import Header from "@/app/components/Header";
import ProjectImage from "@/app/components/ProjectImage";
import Subheader from "@/app/components/Subheader";
import blender from "../../../../public/images/lander/blender.png";
import landerGif from "../../../../public/images/lander/lander-legs.gif";
import landerLanded from "../../../../public/images/lander/lander-landed.png";
import landerFlight from "../../../../public/images/lander/lander-flight.png";
import procreateSketch from "../../../../public/images/lander/procreate.png";

export default function ProjectPage() {
  return (
    <>
      <ContentSection>
        <Header>Lander (WIP)</Header>
        <span className="text-sm text-slate-400">
          DESIGN · DEVELOPMENT · 3D ART
        </span>
        <p>
          I wanted to make a game using WebGL and React. This was inspired by
          games like Kerbal Space Program, Lunar Lander, and Highfleet. Try to
          land without crashing or running out of fuel.
        </p>
        <p>
          Made using{" "}
          <a
            href="https://github.com/pmndrs/react-three-fiber"
            className="underline underline-offset-4"
          >
            @react-three/fiber
          </a>
          ,{" "}
          <a
            href="https://github.com/pmndrs/drei"
            className="underline underline-offset-4"
          >
            @react-three/drei
          </a>
          ,{" "}
          <a
            href="https://github.com/pmndrs/react-three-rapier"
            className="underline underline-offset-4"
          >
            @react-three/rapier
          </a>
          ,{" "}
          <a
            href="https://github.com/pmndrs/zustand"
            className="underline underline-offset-4"
          >
            zustand
          </a>
          ,{" "}
          <a
            href="https://procreate.com/"
            className="underline underline-offset-4"
          >
            procreate
          </a>{" "}
          and{" "}
          <a
            href="https://blender.org/"
            className="underline underline-offset-4"
          >
            blender.
          </a>
        </p>
      </ContentSection>
      <ProjectImage
        src={landerFlight}
        alt={"Connect web-app desktop and mobile views"}
        caption={"Try to land without crashing or running out of fuel."}
      />
      <ProjectImage
        src={landerLanded}
        alt={"Landed"}
        caption={"Hoorah!"}
      />
      <ContentSection>
        <Subheader>Lander Design</Subheader>
        <p>Iterated on the design using Procreate on iPad before modeling, rigging and animating in Blender.</p>
      </ContentSection>
      <ProjectImage
        src={procreateSketch}
        alt={"Sketches of lander design"}
        caption={"A few sketches"}
      />
      <ProjectImage
        src={blender}
        alt={"Screenshot of blender"}
        caption={"Modeling and rigging in blender"}
      />
      <ProjectImage
        src={landerGif}
        alt={"Animation of lander's legs"}
        caption={""}
        unoptimized={true}
      />
    </>
  );
}
