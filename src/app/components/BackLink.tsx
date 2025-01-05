import Link from "next/link";
import React from "react";

export default function BackLink() {
  return (
    <Link
      className="justify-self-start flex items-center gap-2 hover:underline hover:underline-offset-4"
      href="/"
    >
      ← Back
    </Link>
  );
}
