import { fixedTheme } from '@/styles/themeCanvas'
import {
  ScrollArea,
  ScrollAreaProps,
  useMantineTheme,
} from '@mantine/core'

interface MaxHeightScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: number,
  scrollAreaProps?: ScrollAreaProps,
}

export default function MaxHeightScrollArea(props: MaxHeightScrollAreaProps) {
  const theme = useMantineTheme()

  const {
    maxHeight,
    scrollAreaProps,
    children,
    ...divProps
  } = props

  return (
    <div style={{ display: 'flex' }} {...divProps}>
      <ScrollArea
        {...scrollAreaProps}
        style={{
          flexGrow: 1,
          maxHeight: maxHeight ? maxHeight : fixedTheme.fieldMaxHeight,
        }}
        offsetScrollbars
        scrollHideDelay={0}
        scrollbarSize={fixedTheme.scrollbarSize}
        styles={{
          scrollbar: {
            borderRadius: fixedTheme.scrollbarSize / 2,
            '&:hover': {
              backgroundColor: theme.other.scrollbarColor,
            },
          },
          thumb: {
            backgroundColor: theme.other.scrollbarThumbColor,
          },
        }}
      >
        {children}
      </ScrollArea>
    </div>
  )
}