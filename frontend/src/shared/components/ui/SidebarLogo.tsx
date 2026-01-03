import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSidebar } from "./sidebar";
import logoImage from "../../../assets/ai-career-guide-logo.png";

export const SidebarLogo = () => {
  const { open, animate } = useSidebar();

  return (
    <Link
      to="/"
      className="font-normal flex space-x-3 items-center text-sm text-primary py-2 relative z-20 group"
    >
      <div className="relative flex items-center justify-center h-10 w-10 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
        <img 
          src={logoImage} 
          alt="AI Career Guide" 
          className="h-10 w-10 object-contain"
        />
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
      className="font-normal flex space-x-2 items-center text-sm text-primary py-2 relative z-20 group"
    >
      <div className="relative flex items-center justify-center h-10 w-10 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
        <img 
          src={logoImage} 
          alt="AI Career Guide" 
          className="h-10 w-10 object-contain"
        />
      </div>
    </Link>
  );
};

