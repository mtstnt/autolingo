import { PortalHost } from "@rn-primitives/portal";
import { Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { NAV_THEME } from "@/lib/theme";
import { StackHeader } from "expo-router/build/layouts/stack-utils";
import { Text } from "react-native";
import "../global.css";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const scheme = "dark";

  return (
    <ThemeProvider value={NAV_THEME[scheme]}>
      {/* <StatusBar style={scheme === "dark" ? "light" : "dark"} /> */}
      <StatusBar style={scheme} />
      <Stack>
        <StackHeader asChild>
          <Text className="p-5 text-xl font-bold dark:text-white">😀 Hello world!</Text>
        </StackHeader>
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}
