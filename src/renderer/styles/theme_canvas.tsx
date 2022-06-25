import {
  InputVariant,
  MantineProviderProps,
  MantineSize,
  MantineThemeOverride,
} from '@mantine/core'
import { mantineColors } from '@/styles/mantineColors'

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
  handleDraggableOpacity: 0,
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
    canvasBackgroundColor: mantineColors.dark[7], // not used?
    nodeHeaderBackgroundColor: mantineColors.blue[9],
    nodeBackgroundColor: mantineColors.dark[5],
    fieldBackgroundColor: mantineColors.dark[5],
    socketColor: mantineColors.blue[9],
    iconColor: mantineColors.dark[1], // not used?
    textColor: mantineColors.gray[2], // not used?
    noodleColor: mantineColors.gray[2],
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
