import { MantineProviderProps, MantineThemeOverride, PaperStylesParams } from '@mantine/core';

const theme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Roboto, sans-serif',
  defaultRadius: 'md',
  primaryColor: 'blue',
  other: {
    shadow: '0px 0px 5px rgb(0 0 0 / 60%)',
    nodePadding: 10,
    handleSize: 14,
    fieldHeight: 40,
  }
}

const styleOverrides: MantineProviderProps['styles'] = {
  Paper: (theme) => ({
    root: {
      boxShadow: theme.other.shadow,
    }
  })
}

export { theme, styleOverrides };