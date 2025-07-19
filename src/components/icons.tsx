import type { SVGProps } from "react";

const IconWrapper = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    shapeRendering="crispEdges"
    {...props}
  />
);

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconWrapper {...props}>
    <rect x="10" y="4" width="4" height="16" />
    <rect x="4" y="10" width="16" height="4" />
  </IconWrapper>
);

export const FlameIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconWrapper {...props}>
    <path d="M12 4 L14 4 L14 6 L16 6 L16 8 L18 8 L18 10 L16 10 L16 12 L18 12 L18 14 L16 14 L16 16 L14 16 L14 18 L12 18 L12 20 L10 20 L10 18 L8 18 L8 16 L6 16 L6 14 L4 14 L4 12 L6 12 L6 10 L4 10 L4 8 L6 8 L6 6 L8 6 L8 4 L10 4 L10 2 L12 2 L12 4 Z M10 10 L12 10 L12 12 L14 12 L14 14 L12 14 L12 16 L10 16 L10 14 L8 14 L8 12 L10 12 L10 10 Z" fill="currentColor" strokeWidth="0" />
  </IconWrapper>
);


export const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
    <IconWrapper {...props}>
        <rect x="8" y="2" width="8" height="2" />
        <rect x="4" y="4" width="16" height="2" />
        <rect x="6" y="6" width="2" height="14" />
        <rect x="16" y="6" width="2" height="14" />
        <rect x="10" y="6" width="4" height="14" />
        <rect x="6" y="20" width="12" height="2" />
    </IconWrapper>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconWrapper {...props}>
    <path d="M6 12 L8 10 L10 12 L16 6 L18 8 L10 16 L6 12 Z" fill="currentColor" strokeWidth="0" />
  </IconWrapper>
);
