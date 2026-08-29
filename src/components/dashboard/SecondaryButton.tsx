import type { ReactNode } from "react";
import styles from "./SecondaryButton.module.css";

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
}

export default function SecondaryButton({
  children,
  onClick,
  disabled,
  loading,
  fullWidth,
  type = "button",
}: SecondaryButtonProps) {
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
