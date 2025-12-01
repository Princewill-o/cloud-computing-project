import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSidebar } from "./sidebar";

export const SidebarLogo = () => {
  const { open, animate } = useSidebar();

  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-primary py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-brand-600 dark:bg-brand-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="font-medium text-primary whitespace-pre"
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
      className="font-normal flex space-x-2 items-center text-sm text-primary py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-brand-600 dark:bg-brand-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

