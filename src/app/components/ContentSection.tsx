import React, { ReactNode } from "react";

export default function ContentSection({ children }: { children: ReactNode }) {
  return <div className="p-0 lg:px-16 flex flex-col gap-4 text-lg">{children}</div>;
}
