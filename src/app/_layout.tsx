import { PortalHost } from "@rn-primitives/portal";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { NAV_THEME } from "@/lib/theme";
import { StackHeader } from "expo-router/build/layouts/stack-utils";
import "../global.css";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme ?? "light";

  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack>
        <StackHeader hidden />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
