import type {
  InputVariant,
  MantineProviderProps,
  MantineSize,
  MantineTheme,
  MantineThemeOverride,
} from '@mantine/core'
import defaultTheme from '@/styles/mantineDefaultTheme'

/** Style variables that are the same for all themes. */
export const fixedTheme = {
  // Layout: General
  iconSize: 18,
  scrollbarSize: 12,
  // Layout: Canvas
  gridSize: 25,
  gridMinorRadius: 1.5,
  gridMajorRadius: 2.5,
  // Layout: Nodes
  nodeWidth: 300,
  nodePadding: 5,
  nodeFieldSpacing: 5,
  // Layout: Noodles
  handleSize: 14,
  handleDraggableSize: 40,
  // Layout: Fields
  fieldInnerMargin: 0,
  fieldLabelMargin: 8,
  fieldDefaultHeight: 30,
  fieldMaxHeight: 150,
  // Radius
  fieldContainerRadius: 'md' as MantineSize, // only visible if theme.other.fieldBorder is set
  // Debugging
  handleDraggableOpacity: 0,
  noodleBackgroundOpacity: 0,
}

/** Syle variables that depend on the color scheme. */
export const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: defaultTheme.fontFamily,
  defaultRadius: 'md',
  primaryColor: 'blue',
  fontSizes: {
    'xs': 11,
    'sm': 13,
    'md': 14,
    'lg': 15,
    'xl': 16
  },
  other: {
    // Colors
    canvasBackgroundColor: defaultTheme.colors.dark[7],
    nodeHeaderBackgroundColor: defaultTheme.colors.blue[9],
    nodeBackgroundColor: defaultTheme.colors.dark[5],
    fieldBackgroundColor: defaultTheme.colors.dark[5],
    socketColor: defaultTheme.colors.blue[9],
    iconColor: defaultTheme.colors.dark[0],
    textColor: defaultTheme.colors.gray[4],
    noodleColor: defaultTheme.colors.gray[2],
    scrollbarColor: 'rgba(0, 0, 0, 0.55)',
    scrollbarThumbColor: 'rgba(255, 255, 255, 0.4)',
    gridMinorColor: 'rgba(255, 255, 255, 0.08)',
    gridMajorColor: 'rgba(255, 255, 255, 0.1)',
    // Shadows
    nodeContainerShadow: '0px 0px 5px rgba(0, 0, 0, 0.6)',
    fieldContainerShadow: 'none',
    // Borders
    fieldBorder: '1px none rgba(255, 255, 255, 0.3)',
    nodeHoverOutline: `2px solid ${defaultTheme.colors.blue[9]}`,
    nodeActiveOutline: '2px solid rgba(255, 255, 255, 0.6)',
    // Mantine-specific
    fieldComponentVariant: 'filled',
  },
}

declare module '@mantine/core' {
  export interface MantineThemeOther {
    // Colors
    canvasBackgroundColor: string
    nodeBackgroundColor: string
    nodeHeaderBackgroundColor: string
    fieldBackgroundColor: string
    socketColor: string
    iconColor: string
    textColor: string
    noodleColor: string
    scrollbarColor: string
    scrollbarThumbColor: string
    gridMinorColor: string
    gridMajorColor: string
    // Shadows
    nodeContainerShadow: string
    fieldContainerShadow: string
    // Borders
    fieldBorder: string
    nodeHoverOutline: string
    nodeActiveOutline: string
    // Mantine-specific
    fieldComponentVariant: InputVariant
  }
}

const inputOverrides = (theme: MantineTheme) => ({
  filledVariant: {
    backgroundColor: theme.colors.dark[7],
  },
  input: {
    fontSize: theme.fontSizes.md,
    color: theme.other.textColor,
  },
})

export const styleOverrides: MantineProviderProps['styles'] = {
  Select: inputOverrides,
  TextInput: inputOverrides,
  MultiSelect: inputOverrides,
}

export const classNames = {
  Select: { root: 'mantine-select-filled' },
}
