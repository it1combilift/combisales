"use client";

import { motion } from "framer-motion";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/20 p-4 md:p-10 dark:bg-muted/10 relative overflow-hidden">
      {/* <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-50 dark:opacity-20"></div> */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm md:max-w-4xl"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
}
