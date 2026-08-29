import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type ChipVariant = "primary" | "positive" | "warning" | "neutral";

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
}

export default function Chip({ children, variant = "neutral" }: ChipProps) {
  return <span className={`${styles.chip} ${styles[variant]}`}>{children}</span>;
}
