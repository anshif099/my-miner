"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/profile";
import { useAuth } from "@/hooks/use-auth";
const schema = z.object({ displayName: z.string().max(100).optional(), email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;
export default function LoginPage() { const [registering, setRegistering] = useState(false); const [serverError, setServerError] = useState(""); const router = useRouter(); const { user, loading } = useAuth(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  useEffect(() => { if (!loading && user) router.replace("/dashboard"); }, [loading, user, router]);
  const submit = async (values: FormValues) => { setServerError(""); try { if (registering) { const result = await createUserWithEmailAndPassword(auth, values.email, values.password); if (values.displayName) await updateProfile(result.user, { displayName: values.displayName }); await ensureUserProfile(result.user); } else { const result = await signInWithEmailAndPassword(auth, values.email, values.password); await ensureUserProfile(result.user); } router.replace("/dashboard"); } catch { setServerError("Authentication failed. Check your email, password, and Firebase configuration."); } };
  return <main className="grid min-h-screen place-items-center p-4"><section className="panel w-full max-w-md p-7"><div className="mb-6"><p className="muted mb-1 text-sm">PRIVATE CONTROLLER</p><h1 className="m-0 text-3xl">{registering ? "Create account" : "Welcome back"}</h1></div><form className="space-y-4" onSubmit={handleSubmit(submit)}>{registering && <label className="block">Display name<input className="field mt-1" {...register("displayName")}/></label>}<label className="block">Email<input className="field mt-1" type="email" autoComplete="email" {...register("email")}/>{errors.email && <small className="text-red-500">{errors.email.message}</small>}</label><label className="block">Password<input className="field mt-1" type="password" autoComplete={registering ? "new-password" : "current-password"} {...register("password")}/>{errors.password && <small className="text-red-500">{errors.password.message}</small>}</label>{serverError && <p role="alert" className="text-red-500">{serverError}</p>}<button className="button w-full" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : registering ? "Register" : "Sign in"}</button></form><button className="muted mt-5 w-full text-sm" onClick={() => setRegistering((v) => !v)}>{registering ? "Already registered? Sign in" : "New here? Create an account"}</button></section></main>;
}
