import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  text: string;
  size?: "sm" | "md";
}

const InfoTooltip = ({ text, size = "sm" }: InfoTooltipProps) => {
  const iconClass =
    size === "md"
      ? "w-3.5 h-3.5 text-muted-foreground/40"
      : "w-3 h-3 text-muted-foreground/40";

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help inline-flex">
            <Info className={iconClass} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[220px]">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
