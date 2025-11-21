"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      {/* Light Mode - Radial Gradient from Top */}
      <div
        className="absolute inset-0 z-0 pointer-events-none dark:hidden"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
        }}
      />
      {/* Dark Mode - Horizon Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none hidden dark:block"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #000000 40%, #0d1a36 100%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm md:max-w-4xl relative z-10"
      >
        <Suspense fallback={<Spinner className="size-8 mx-auto" />}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
