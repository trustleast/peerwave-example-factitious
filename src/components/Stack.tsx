import React from "react";

type Props = {
  alignItems?: "left" | "center" | "top";
  justifyContent?: "left" | "center" | "top";
  direction?: "row" | "column";
  gap?: "none" | "small" | "medium";
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const gaps = {
  none: "0",
  small: "0.5rem",
  medium: "1rem",
};

export const Stack: React.FunctionComponent<Props> = ({
  children,
  alignItems,
  justifyContent,
  gap = "small",
  direction = "row",
  ...props
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap: gaps[gap],
        alignItems: alignItems,
        justifyContent: justifyContent,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
