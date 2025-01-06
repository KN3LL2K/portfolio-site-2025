import ContentSection from "@/app/components/ContentSection";
import Header from "@/app/components/Header";
import ProjectImage from "@/app/components/ProjectImage";
import green from "../../../../public/images/gen-art/green.png";
import red from "../../../../public/images/gen-art/red.png";
import redgreen from "../../../../public/images/gen-art/redgreen.png";

export default function ProjectPage() {
  return (
    <>
      <ContentSection>
        <Header>Flow Fields</Header>
        <p>
          I like to dabble with all things visual: drawing, painting,
          photography, and sometimes coding generative art. This was a fun
          experiment learning about Flow Fields.
        </p>
        <p>
          Made using{" "}
          <a href="https://p5js.org/" className="underline underline-offset-4">
            p5.js
          </a>
          , poisson disk sampling from{" "}
          <a
            href="https://github.com/kchapelier/poisson-disk-sampling"
            className="underline underline-offset-4"
          >
            kchapelier.
          </a>
        </p>
      </ContentSection>
      <div className="grid grid-rows-3 grid-cols-1 md:grid-cols-3 md:grid-rows-1 gap-2">
        <ProjectImage
          // className=""
          src={red}
          alt={"Connect web-app desktop and mobile views"}
          caption={""}
        />
        <ProjectImage
          // className=""
          src={redgreen}
          alt={"Connect web-app desktop and mobile views"}
          caption={""}
        />
        <ProjectImage
          // className=""
          src={green}
          alt={"Connect web-app desktop and mobile views"}
          caption={""}
        />
      </div>
    </>
  );
}
