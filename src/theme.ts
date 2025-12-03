import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        body: { value: "Arial, Helvetica, sans-serif" },
        heading: { value: "Arial, Helvetica, sans-serif" },
        mono: { value: "Arial, Helvetica, sans-serif" },
      },
    },
  },
});

