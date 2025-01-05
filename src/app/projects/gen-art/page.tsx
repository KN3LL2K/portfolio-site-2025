import ContentSection from "@/app/components/ContentSection";
import Header from "@/app/components/Header";
import ProjectImage from "@/app/components/ProjectImage";
import Subheader from "@/app/components/Subheader";
import connectResponsiveImage from "../../../../public/images/connect-responsive.png";

export default function ProjectPage() {
  return (
    <>
      <ContentSection>
        <Header>Confident LIMS</Header>
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
          My role involved designing and building the UI. I also contributed to
          the WebGL visualization.
        </p>
      </ContentSection>
      <ContentSection>
        <Subheader>Rewrite & Redesign</Subheader>
        <p>
          Migrated codebase from Angular.js to React with Typescript to improve
          code maintainability, developer experience and efficiency.
        </p>
      </ContentSection>
      <ProjectImage
        className=""
        src={connectResponsiveImage}
        alt={"Connect web-app desktop and mobile views"}
        caption={"Responsive Layout"}
      />
      <ContentSection>
        <Subheader>Increased Workflow</Subheader>
        <p>Lorem ipsum</p>
      </ContentSection>
    </>
  );
}
