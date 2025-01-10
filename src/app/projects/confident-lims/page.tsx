import ContentSection from "@/app/components/ContentSection";
import Header from "@/app/components/Header";
import ProjectImage from "@/app/components/ProjectImage";
import Subheader from "@/app/components/Subheader";
import clientsBeforeAfter from "../../../../public/images/lims/clients-before-after2.png";
import darkMode from "../../../../public/images/lims/dark-mode.png";
import sampleDesktop from "../../../../public/images/lims/samples-desktop.png";
import importerModal from "../../../../public/images/lims/importers-applying.png";
import overview from "../../../../public/images/lims/overview.png";

export default function ProjectPage() {
  return (
    <>
      <ContentSection>
        <Header>Confident LIMS</Header>
        <span className="text-sm text-slate-400">
          PRODUCT DESIGN · UI/UX DESIGN · DEVELOPMENT
        </span>
        <span className="text-sm text-slate-400">
          May 2022 - Today
        </span>
        <p>
          <a
            className="text-blue-700 underline"
            href="https://confidentlims.com/"
            target="_blank"
          >
            Confident LIMS
          </a>{" "}
          provides tools for analytical testing labs and their clients,
          primarily a Laboratory Information Management System.
        </p>
        <p>
          Since joining the LIMS team in 2022, I have been leading the re-design
          and re-write of the app, improving existing workflows, and adding new
          features that increase productivity and usability.
        </p>
      </ContentSection>
      <ContentSection>
        <Subheader>Rewrite & Redesign</Subheader>
        <p>
          Coordinated the planning and execution of migrating the codebase from
          Angular.js to React with Typescript to improve code maintainability,
          developer experience and development efficiency.
        </p>
        <p>
          Introduced a whole new design system, utilizing design tokens to
          create a maintainable and flexible theme that encompasses our brand.
        </p>
      </ContentSection>
      <ProjectImage
        src={sampleDesktop}
        alt={"New client page desktop view"}
        caption={"The updated sample's page"}
      />
      <ProjectImage
        src={darkMode}
        alt={"Dark mode example"}
        caption={"Also added a dark mode!"}
      />
      <ProjectImage
        src={clientsBeforeAfter}
        className=""
        alt={"New client page desktop view"}
        caption={"Before and after of the Clients page"}
      />
      <ContentSection>
        <Subheader>New &amp; Improved Workflows</Subheader>
        <p>
          A lab runs on efficiency and every click counts. A common theme across
          a few major painpoints were a result of the apps layout and
          navigation. Core workflow actions required navigating to nested views,
          for each sample a user is working on, which is sometimes hundreds of
          samples.
        </p>
        <p>
          I designed and engineered solutions to reduce clicks, hoist
          functionality to meet the user where they are and empower users to
          perform actions across multiple samples at a time.
        </p>
      </ContentSection>
      <ProjectImage
        src={overview}
        alt={"Assay overview page"}
        caption={
          "This previously read-only overview page was made to be interactive."
        }
      />
      <ContentSection>
        <p>
          Another core feature involved importing csv instrument data for many
          sample&apos;s results. This previously would require navigating to a
          separate page for each imported sample and performing an action.
        </p>
        <p>
          The underlying core business logic and UI were updated to reduce
          clicks from approximately 6 clicks per imported sample, to just 3 or 4
          clicks, dramatically saving users time.
        </p>
      </ContentSection>
      <div className="px-12 md:px-16 lg:px-56">
        <ProjectImage
          src={importerModal}
          alt={"Import results dialog"}
          caption={""}
        />
      </div>
    </>
  );
}
