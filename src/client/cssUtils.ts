import { Theme } from "@material-ui/core";
import { CSSProperties } from "@material-ui/styles";

interface Options {
  alignItems: string;
}

export const infoTable = (theme: Theme, options?: Options): CSSProperties => ({
  alignItems: options?.alignItems || "baseline",
  display: "grid",
  columnGap: `${theme.spacing(1)}px`,
  gridTemplateColumns: "max-content 1fr",
});
