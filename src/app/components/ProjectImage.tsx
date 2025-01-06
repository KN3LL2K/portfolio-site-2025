import React from "react";
import Image, { StaticImageData } from "next/image";

export interface ProjectImageProps {
  src: string | StaticImageData;
  height?: number;
  width?: number;
  alt: string;
  caption: string;
  className?: string;
  unoptimized?: boolean
}

export default function ProjectImage({
  src,
  alt,
  caption,
  className = "rounded-xl shadow-md",
  ...rest
}: ProjectImageProps) {
  return (
    <div className="flex flex-col gap-2 items-center text-sm text-gray-500">
      <Image
        className={className}
        // height={500}
        src={src}
        alt={alt}
        {...rest}
      />
      <span>{caption}</span>
    </div>
  );
}
