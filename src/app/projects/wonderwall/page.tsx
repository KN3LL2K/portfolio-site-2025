import ContentSection from "@/app/components/ContentSection";
import Header from "@/app/components/Header";
import ProjectImage from "@/app/components/ProjectImage";
import Subheader from "@/app/components/Subheader";
import openaiPrototype from "../../../../public/images/wonderwall/openai-prototype.png";
import richTextInput from "../../../../public/images/wonderwall/rich-text-input.png";

export default function ProjectPage() {
  return (
    <>
      <ContentSection>
        <Header>Wonderwall</Header>
        <span className="text-sm text-slate-400">DEVELOPMENT</span>
        <span className="text-sm text-slate-400">
          Oct 2022 - Jul 2023
        </span>
        <p>
          <a
            className="text-blue-700 underline"
            href="https://usewonderwall.com/"
            target="_blank"
          >
            Wonderwall
          </a>{" "}
          is a new approach to tackling measuring work productivity. Post your
          wins daily and keep track of what you&apos;ve accomplished.
        </p>
        <p>
          My role involved building portions of the UI, and building out a
          ChatGPT integration using pinecone.
        </p>
      </ContentSection>
      <ContentSection>
        <Subheader>ChatGPT</Subheader>
        <p>
          Prototyped a Q&A tool for summarizing data. Get easy-to-digest answers
          to your questions about what your teams have been working on.
        </p>
      </ContentSection>
      <div className="px-12 md:px-16 lg:px-56">
        <ProjectImage
          src={openaiPrototype}
          alt={"UI for openAI prototype"}
          caption={"Q&A interface"}
        />
      </div>
      <ContentSection>
        <Subheader>Rich Text Support</Subheader>
        <p>
          Built rich text input with support for tagging users and projects.
        </p>
      </ContentSection>
      <div className="px-12 md:px-16 lg:px-56">
        <ProjectImage
          src={richTextInput}
          alt={"Rich text input"}
          caption={"Rich text editing"}
        />
      </div>
    </>
  );
}
