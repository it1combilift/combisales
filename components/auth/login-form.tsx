import type { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { H1 } from "../fonts/fonts";
import { Label } from "../ui/label";
import { motion } from "framer-motion";
import { Spinner } from "../ui/spinner";
import { signIn } from "next-auth/react";
import { Checkbox } from "../ui/checkbox";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLoginSchema } from "@/schemas/auth";
import { useTranslation } from "@/lib/i18n/context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const IMAGE_URL =
    "https://res.cloudinary.com/dwjxcpfrf/image/upload/v1768957949/Untitled_design__1_-removebg-preview_t8oji9.png";

  const schema = createLoginSchema(t);
  type LoginValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "AccountBlocked") {
      toast.error(t("loginForm.toasts.accountBlocked"));
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    } else if (error === "OAuthAccountNotLinked") {
      toast.error(t("loginForm.toasts.zohoLinkError"), { duration: 6000 });
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    } else if (error) {
      toast.error(
        t("loginForm.toasts.authError", {
          error: decodeURIComponent(error),
        }),
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, t]);

  // Function to handle credentials login
  async function onSubmit(values: LoginValues) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "ACCOUNT_BLOCKED") {
          toast.error(t("loginForm.toasts.accessDeniedBlocked"), {
            duration: 6000,
          });
        } else {
          toast.error(t("loginForm.toasts.invalidCredentials"));
        }
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success(t("loginForm.toasts.loginSuccess"));
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.push("/dashboard/tasks");
        router.refresh();
      } else {
        toast.error(t("loginForm.toasts.unexpectedError"));
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(t("loginForm.toasts.genericAuthError"));
      setIsLoading(false);
    }
  }

  // Function to handle Zoho login
  async function handleZohoLogin() {
    setIsLoading(true);
    try {
      await signIn("zoho", { callbackUrl: "/dashboard/tasks" });
    } catch (error) {
      toast.error(t("loginForm.toasts.zohoAuthError"));
      setIsLoading(false);
    }
  }

  return (
    <section className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-none shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="grid p-0 md:grid-cols-2 px-2">
          <div className="flex flex-col justify-center px-2 sm:px-3 md:px-4 bg-background relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
            >
              <div className="flex flex-col items-center text-center">
                {/* Logo visible solo en pantallas pequeñas */}
                <div className="md:hidden mb-3">
                  <div className="relative w-32 h-16 sm:w-40 sm:h-20 mx-auto dark:rounded-xl dark:bg-white/95 dark:p-3 dark:shadow-sm dark:ring-1 dark:ring-white/10 overflow-hidden bg-white/95 p-2 rounded-lg shadow-sm ring-1 ring-black/5">
                    <Image
                      src={IMAGE_URL}
                      alt="CombiSales Logo"
                      fill
                      className="object-contain object-center"
                      priority
                    />
                  </div>
                </div>
                <H1>{t("loginForm.title")}</H1>
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty max-w-xs sm:max-w-sm text-center">
                  {t("loginForm.description")}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground/80"
                    >
                      {t("loginForm.email_label")}
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute hidden md:block md:left-3 md:top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("loginForm.email_placeholder")}
                        aria-invalid={Boolean(errors.email)}
                        {...register("email")}
                        disabled={isLoading}
                        className={cn(
                          "md:pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all text-sm",
                          errors.email && "border-destructive",
                        )}
                      />
                    </div>
                    {errors.email?.message && (
                      <p role="alert" className="text-xs text-destructive mt-1">
                        {String(errors.email?.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-foreground/80"
                      >
                        {t("loginForm.password_label")}
                      </Label>
                      {/* <Link
                        href="#"
                        className="text-xs font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                      >
                        {t("loginForm.forgotPassword")}
                      </Link> */}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute hidden md:block md:left-3 md:top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        placeholder={t("loginForm.password_placeholder")}
                        type="password"
                        aria-invalid={Boolean(errors.password)}
                        {...register("password")}
                        disabled={isLoading}
                        className={cn(
                          "md:pl-10 h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 focus-visible:border-primary/30 transition-all text-sm",
                          errors.password && "border-destructive",
                        )}
                      />
                    </div>
                    {errors.password?.message && (
                      <p role="alert" className="text-xs text-destructive mt-1">
                        {String(errors.password?.message)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="remember"
                      render={({ field }) => (
                        <Checkbox
                          id="remember"
                          checked={Boolean(field.value)}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                          className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          disabled={isLoading}
                        />
                      )}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t("loginForm.rememberMe")}
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="default"
                  size="lg"
                  className="font-medium w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner
                        className="size-4 md:size-5"
                        variant="ellipsis"
                      />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("loginForm.login")}
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t("loginForm.or_continue_with")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 font-medium border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
                  disabled={isLoading}
                  onClick={handleZohoLogin}
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

          <div className="relative hidden md:block bg-muted overflow-hidden border-l border-white/10 rounded-lg">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 group"
            >
              <Image
                src="/Maquina_2.png"
                alt="CombiSales Login Background"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
                  <div className="w-12 h-1 bg-white/80 mb-2 rounded-full" />

                  <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    {t("common.appName")}
                  </h2>

                  <p className="text-white/90 text-xs sm:text-sm font-light leading-relaxed drop-shadow-sm max-w-full text-wrap">
                    {t("common.description")}
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
