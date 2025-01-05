import Link from "next/link";
import React from "react";

export interface BentoCardProps {
  overline: string;
  title: string;
  description: string;
  href: string;
  size?: number;
}

export default function BentoCard({
  overline,
  title,
  description,
  href,
  size = 2,
}: BentoCardProps) {
  const colSpan = size === 4 ? "lg:col-span-4" : "lg:col-span-2";
  const cls = `flex p-px ${colSpan}`;
  return (
    <Link href={href} className={cls}>
      <div className="overflow-hidden w-full bg-slate-100 hover:bg-slate-200 rounded-lg ring-1 ring-white/15 p-10 text-slate-500">
        <span className="text-sm text-slate-400">{overline}</span>
        <h3 className="text-2xl font-bold text-slate-700">{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}
