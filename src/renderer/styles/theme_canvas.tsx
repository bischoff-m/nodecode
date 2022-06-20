import {
  InputVariant,
  MantineProviderProps,
  MantineSize,
  MantineThemeOverride,
} from '@mantine/core'

// style variables that are the same for all themes
const fixedTheme = {
  // layout
  gridSize: 20,
  nodeWidth: 300,
  nodePadding: 10,
  handleSize: 14,
  handleDraggableSize: 40,
  fieldInnerMargin: 4,
  fieldDefaultHeight: 36,
  iconSize: 18,
  // radius
  fieldContainerRadius: 'md' as MantineSize,
  // fonts
  // fontWeight: 300, // TODO: Roboto font only supports normal and bold
  // debugging
  handleDraggableOpacity: 0.5,
  noodleBackgroundOpacity: 0,
}

// style variables that depend on the color scheme
const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: 'Roboto, sans-serif',
  defaultRadius: 'md',
  primaryColor: 'blue',
  other: {
    // colors
    canvasBackgroundColor: '#1A1B1E', // dark[7]
    nodeHeaderBackgroundColor: '#1864AB', // blue[9]
    nodeBackgroundColor: '#2C2E33', // dark[5]
    fieldBackgroundColor: '#2C2E33', // dark[5]
    socketColor: '#1864AB', // blue[9]
    iconColor: '#969696',
    textColor: '#e9e9e9',
    noodleColor: '#e9e9e9',
    // shadows
    nodeContainerShadow: '0px 0px 5px rgb(0 0 0 / 60%)',
    fieldContainerShadow: 'none',
    // borders
    fieldBorder: '1px solid hsl(0 0% 100% / 10%)',
    nodeHoverOutline: '1px solid hsl(0 0% 100% / 60%)',
    // mantine-specific
    fieldComponentVariant: 'filled',
  },
}

declare module '@mantine/core' {
  export interface MantineThemeOther {
    canvasBackgroundColor: string
    nodeBackgroundColor: string
    nodeHeaderBackgroundColor: string
    fieldBackgroundColor: string
    socketColor: string
    iconColor: string
    textColor: string
    noodleColor: string
    nodeContainerShadow: string
    fieldContainerShadow: string
    fieldBorder: string
    nodeHoverOutline: string
    fieldComponentVariant: InputVariant
  }
}

const styleOverrides: MantineProviderProps['styles'] = {
  Select: (theme) => ({
    filledVariant: {
      backgroundColor: theme.colors.dark[7],
    },
  }),
  TextInput: (theme) => ({
    filledVariant: {
      backgroundColor: theme.colors.dark[7],
    },
  }),
}

const classNames = {
  Select: { root: 'mantine-select-filled' },
}

export {
  fixedTheme,
  mantineTheme,
  styleOverrides,
  classNames,
}
