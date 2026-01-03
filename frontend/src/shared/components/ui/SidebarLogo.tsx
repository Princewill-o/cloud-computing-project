import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSidebar } from "./sidebar";
import { Brain, Sparkles } from "lucide-react";

export const SidebarLogo = () => {
  const { open, animate } = useSidebar();

  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-primary py-1 relative z-20 group"
    >
      <div className="relative flex items-center justify-center h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex-shrink-0 group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-200">
        <Brain className="h-4 w-4 text-white" />
        <Sparkles className="h-2 w-2 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" />
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="font-semibold text-primary whitespace-pre bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
      >
        AI Career Guide
      </motion.span>
    </Link>
  );
};

export const SidebarLogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-primary py-1 relative z-20 group"
    >
      <div className="relative flex items-center justify-center h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex-shrink-0 group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-200">
        <Brain className="h-4 w-4 text-white" />
        <Sparkles className="h-2 w-2 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" />
      </div>
    </Link>
  );
};

