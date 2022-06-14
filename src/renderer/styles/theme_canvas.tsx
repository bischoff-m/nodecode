import { MantineProviderProps, MantineSize, MantineThemeOverride } from '@mantine/core';

type FixedTheme = {

}

// style variables that are the same for all themes
const fixedTheme = {
  // layout
  gridSize: 20,
  nodeWidth: 300,
  nodePadding: 10,
  handleSize: 14,
  fieldInnerMargin: 4,
  fieldDefaultHeight: 36,
  // radius
  fieldContainerRadius: 'md' as MantineSize,
  // fonts
  // fontWeight: 300, // TODO: Roboto font only supports normal and bold
}

// style variables that depend on the color scheme
const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Roboto, sans-serif',
  defaultRadius: 'md',
  primaryColor: 'blue',
  other: {
    // colors
    canvasBackgroundColor: '#1d1d1d',
    nodeBackgroundColor: '#303030',
    nodeHeaderBackgroundColor: '#1864ab',
    fieldBackgroundColor: '#1a1b1e',
    socketColor: '#1864ab',
    iconColor: '#969696',
    textColor: '#e9e9e9',
    // shadows
    nodeContainerShadow: '0px 0px 5px rgb(0 0 0 / 60%)',
    fieldContainerShadow: 'none',
    // borders
    fieldBorder: '1px solid hsl(0 0% 100% / 10%)',
    nodeHoverOutline: '1px solid hsl(0 0% 100% / 40%)',
  }
}

const styleOverrides: MantineProviderProps['styles'] = {
  // Paper: (theme) => ({
  //   root: {
  //     boxShadow: fixedTheme.nodeContainerShadow,
  //   }
  // })
}

export { fixedTheme, mantineTheme, styleOverrides };