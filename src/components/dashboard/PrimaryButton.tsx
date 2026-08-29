import type { ReactNode } from "react";
import styles from "./PrimaryButton.module.css";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
}

export default function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  fullWidth,
  type = "button",
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${fullWidth ? styles.fullWidth : ""}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
