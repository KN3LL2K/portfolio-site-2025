import ContentSection from "@/app/components/ContentSection";
import Header from "@/app/components/Header";
import ProjectImage from "@/app/components/ProjectImage";
import connectBookmarksImage from "../../../../public/images/connect-responsive-bookmarks.png";
import connectSearchImage from "../../../../public/images/connect-responsive-search.png";
import connectResponsiveImage from "../../../../public/images/connect-responsive.png";

export default function ProjectPage() {
  return (
    <>
      <ContentSection>
        <Header>Connect - Confident LIMS</Header>
        <p>
          <a
            className="text-blue-700 underline"
            href="https://connect.confidentcannabis.com/"
            target="_blank"
          >
            Connect
          </a>{" "}
          is a 3D data visualization tool to compare the chemical composition of
          cannabis strains, built on a data set of results from over 100 testing
          labs. Designed primarily as an educational tool, it also served as a
          lead generation tool for the (now shutdown) Confident Wholesale
          platform.
        </p>
        <p>
          My role involved designing and building the UI. I also contributed to
          the WebGL visualization.
        </p>
      </ContentSection>
      <ProjectImage
        className=""
        src={connectResponsiveImage}
        alt={"Connect web-app desktop and mobile views"}
        caption={"Responsive Layout"}
      />
      <ProjectImage
        className=""
        src={connectSearchImage}
        alt={"Connect web-app desktop search feature"}
        caption={"Search and filtering"}
      />
      <ProjectImage
        className=""
        src={connectBookmarksImage}
        alt={"Connect web-app desktop bookmarks feature"}
        caption={"Bookmarks"}
      />
    </>
  );
}
