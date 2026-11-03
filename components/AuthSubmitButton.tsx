"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  className: string;
  pendingLabel: string;
  disabled?: boolean;
};

export default function AuthSubmitButton({ children, className, pendingLabel, disabled = false }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || pending}
      aria-busy={pending}
      title={disabled ? "Google sign-in is temporarily unavailable" : undefined}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
