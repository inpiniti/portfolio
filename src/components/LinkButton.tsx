"use client";

import { Button } from "@/components/ui/button";

interface Props {
  label: string;
  href: string;
  target?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
}

export function LinkButton({ props }: { props: Props }) {
  return (
    <Button variant={props.variant ?? "default"} asChild>
      <a href={props.href} target={props.target ?? "_self"} rel={props.target === "_blank" ? "noopener noreferrer" : undefined}>
        {props.label}
      </a>
    </Button>
  );
}
