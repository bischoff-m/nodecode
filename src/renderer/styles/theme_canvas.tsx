import {
  InputVariant,
  MantineProviderProps,
  MantineSize,
  MantineThemeOverride,
} from '@mantine/core'
import defaultTheme from '@/styles/mantineDefaultTheme'

// style variables that are the same for all themes
const fixedTheme = {
  // layout
  gridSize: 20,
  nodeWidth: 300,
  nodePadding: 5,
  nodeFieldSpacing: 5,
  handleSize: 14,
  handleDraggableSize: 40,
  fieldInnerMargin: 0,
  fieldLabelMargin: 8,
  fieldDefaultHeight: 30,
  iconSize: 18,
  // radius
  fieldContainerRadius: 'md' as MantineSize, // only visible if theme.other.fieldBorder is set
  // debugging
  handleDraggableOpacity: 0,
  noodleBackgroundOpacity: 0,
}

// style variables that depend on the color scheme
const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: defaultTheme.fontFamily,
  defaultRadius: 'md',
  primaryColor: 'blue',
  fontSizes: {
    "xs": 11,
    "sm": 13,
    "md": 14,
    "lg": 15,
    "xl": 16
  },
  other: {
    // colors
    canvasBackgroundColor: defaultTheme.colors.dark[7],
    nodeHeaderBackgroundColor: defaultTheme.colors.blue[9],
    nodeBackgroundColor: defaultTheme.colors.dark[5],
    fieldBackgroundColor: defaultTheme.colors.dark[5],
    socketColor: defaultTheme.colors.blue[9],
    iconColor: defaultTheme.colors.dark[0],
    textColor: defaultTheme.colors.gray[4],
    noodleColor: defaultTheme.colors.gray[2],
    // shadows
    nodeContainerShadow: '0px 0px 5px rgb(0 0 0 / 60%)',
    fieldContainerShadow: 'none',
    // borders
    fieldBorder: '1px solid hsl(0 0% 100% / 0%)',
    nodeHoverOutline: `2px solid ${defaultTheme.colors.blue[9]}`,
    nodeActiveOutline: '2px solid hsl(0 0% 100% / 60%)',
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
    nodeActiveOutline: string
    fieldComponentVariant: InputVariant
  }
}

const styleOverrides: MantineProviderProps['styles'] = {
  Select: (theme) => ({
    filledVariant: {
      backgroundColor: theme.colors.dark[7],
    },
    input: {
      fontSize: theme.fontSizes.md,
      color: theme.other.textColor,
    },
  }),
  TextInput: (theme) => ({
    filledVariant: {
      backgroundColor: theme.colors.dark[7],
    },
    input: {
      fontSize: theme.fontSizes.md,
      color: theme.other.textColor,
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
