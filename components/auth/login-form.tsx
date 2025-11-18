import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { motion } from "framer-motion";
import { Spinner } from "../ui/spinner";
import { Checkbox } from "../ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, type SyntheticEvent } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }

  return (
    <section className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-none shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 bg-background relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col items-center text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Bienvenido
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto text-pretty">
                  Ingresa tus credenciales para acceder
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Correo Electrónico
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@combilift.com"
                        required
                        className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground/80"
                      >
                        Contraseña
                      </Label>
                      <Link
                        href="#"
                        className="text-xs font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        placeholder="••••••••"
                        required
                        type="password"
                        className="pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Recordar usuario
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      Accediendo...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Acceder <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      O continuar con
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 font-medium border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
                >
                  <Image
                    src="/zoho-logo.svg"
                    alt="Zoho"
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                  Zoho
                </Button>
              </form>
            </motion.div>
          </div>

          <div className="relative hidden md:block bg-muted overflow-hidden border-l border-white/10">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src="/placeholder.svg"
                alt="Logística y Almacenamiento"
                fill
                className="object-cover opacity-90 dark:opacity-60 grayscale-10"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent opacity-50" />

              <div className="absolute inset-4 border border-white/10 rounded-lg pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="w-12 h-1 bg-white/80 mb-6 rounded-full" />
                  <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    CombiSales
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm font-light leading-relaxed drop-shadow-sm max-w-md text-pretty">
                    Gestión de ventas y clientes de Combilift
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
