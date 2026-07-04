"use client";
import { cn } from "@/lib/utils/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Link } from "@/i18n/navigation";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

type SidebarBodyProps = {
  children?: React.ReactNode;
  className?: string;
};

export const SidebarBody = ({ children, className }: SidebarBodyProps) => {
  return (
    <>
      <DesktopSidebar className={className}>{children}</DesktopSidebar>
      <MobileSidebar className={className}>{children}</MobileSidebar>
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
}: SidebarBodyProps) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "hidden h-full w-[300px] shrink-0 bg-[#283C5D] px-4 py-4 md:flex md:flex-col",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "60px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
}: SidebarBodyProps) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#283C5D] text-white shadow-[0_14px_35px_rgba(40,60,93,0.25)] transition hover:bg-[#D8BD8D] hover:text-[#283C5D] md:hidden"
        aria-label="Open menu"
      >
        <IconMenu2 size={22} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-[#283C5D] p-10 md:hidden",
              className
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-10 top-10 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white hover:text-[#283C5D]"
              aria-label="Close menu"
            >
              <IconX size={22} />
            </button>

            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) => {
  const { open, animate, setOpen } = useSidebar();

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    // custom click handler
    if (props.onClick) {
      props.onClick(e);
    }

    // collapse mobile sidebar after navigation
    setOpen(false);
  };

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
      onClick={handleClick}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate
            ? open
              ? "inline-block"
              : "none"
            : "inline-block",

          opacity: animate
            ? open
              ? 1
              : 0
            : 1,
        }}
        className="text-white text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};