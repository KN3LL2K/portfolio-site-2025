import React from "react";

export interface SubheaderProps {
  children?: React.ReactNode;
}

export default function Subheader({ children }: SubheaderProps) {
  return <h3 className="text-2xl font-bold text-slate-700">{children}</h3>;
}
