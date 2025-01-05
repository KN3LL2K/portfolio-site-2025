import React from "react";

export interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return <h1 className="text-4xl font-bold text-slate-700">{children}</h1>;
}