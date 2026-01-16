"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronDown, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleImageProps {
  /** Source path for the image (relative to public folder) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Button label text */
  buttonLabel: string;
  /** Optional className for the container */
  className?: string;
  /** Optional default open state */
  defaultOpen?: boolean;
  /** Max height class for the image - defaults to compact */
  maxHeight?: "compact" | "medium" | "large";
}

interface CollapsibleImageTriggerProps {
  /** Button label text */
  buttonLabel: string;
  /** Whether the collapsible is open */
  isOpen: boolean;
  /** Callback when clicked */
  onClick: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Standalone trigger button for the collapsible image.
 * Can be used inside SectionHeader or other components.
 */
export function CollapsibleImageTrigger({
  buttonLabel,
  isOpen,
  onClick,
  className,
}: CollapsibleImageTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      onClick={onClick}
      className={cn(
        "font-medium transition-colors",
        "hover:bg-primary/5 hover:border-primary/30",
        isOpen && "bg-primary/5 border-primary/30",
        className
      )}
    >
      <ImageIcon className="size-3 text-primary" />
      <span className="hidden sm:inline">{buttonLabel}</span>
      <ChevronDown
        className={cn(
          "size-3 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </Button>
  );
}

interface CollapsibleImageContentProps {
  src: string;
  alt: string;
  maxHeight?: "compact" | "medium" | "large";
  className?: string;
}

/**
 * Content component for the collapsible image.
 * Renders the image with proper sizing.
 */
export function CollapsibleImageContent({
  src,
  alt,
  maxHeight = "compact",
  className,
}: CollapsibleImageContentProps) {
  const maxHeightClasses = {
    compact: "max-h-[180px] sm:max-h-[220px] md:max-h-[260px]",
    medium: "max-h-[240px] sm:max-h-[300px] md:max-h-[360px]",
    large: "max-h-[300px] sm:max-h-[400px] md:max-h-[500px]",
  };

  return (
    <div className={cn("pt-2", className)}>
      <div className="relative rounded-lg border bg-muted/20 overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className={cn(
            "w-full h-auto object-contain",
            maxHeightClasses[maxHeight]
          )}
          priority={false}
        />
      </div>
    </div>
  );
}

/**
 * A reusable collapsible image component for reference images in forms.
 * Provides smooth expand/collapse animation with responsive image display.
 */
export function CollapsibleImage({
  src,
  alt,
  buttonLabel,
  className,
  defaultOpen = false,
  maxHeight = "compact",
}: CollapsibleImageProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <CollapsibleImageTrigger
          buttonLabel={buttonLabel}
          isOpen={isOpen}
          onClick={() => {}}
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "overflow-hidden",
          "data-[state=open]:animate-collapsible-down",
          "data-[state=closed]:animate-collapsible-up"
        )}
      >
        <CollapsibleImageContent src={src} alt={alt} maxHeight={maxHeight} />
      </CollapsibleContent>
    </Collapsible>
  );
}

// Hook for external control of the collapsible state
export function useCollapsibleImage(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return { isOpen, setIsOpen, toggle: () => setIsOpen((prev) => !prev) };
}
