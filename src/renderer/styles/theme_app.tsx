import { MantineThemeOverride } from "@mantine/core";
import { removeColorTags } from '@/util';

const theme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Roboto, sans-serif',
  colors: {
    "mycolor": removeColorTags({
      "50": "#FFE5E5",
      "100": "#FFB8B8",
      "200": "#FF8A8A",
      "300": "#FF5C5C",
      "400": "#FF2E2E",
      "500": "#FF0000",
      "600": "#CC0000",
      "700": "#990000",
      "800": "#660000",
      "900": "#330000"
    }),
  },
  primaryColor: 'mycolor',
}

export default theme