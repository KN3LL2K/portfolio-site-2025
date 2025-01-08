import { Codepen, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://www.linkedin.com/in/harrybellenie/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Linkedin size={16} />
        LinkedIn
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://github.com/KN3LL2K"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github size={16} />
        GitHub
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://codepen.io/KN3LL"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Codepen size={16} />
        Codepen
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="mailto:harrybellenie@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Mail size={16} />
        Email
      </a>
    </footer>
  );
}
