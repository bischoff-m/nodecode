import { fixedTheme } from '@/styles/themeCanvas'
import {
  ScrollArea,
  ScrollAreaProps,
  useMantineTheme,
} from '@mantine/core'

export default function MaxHeightScrollArea(props: ScrollAreaProps) {
  const theme = useMantineTheme()

  return (
    <div style={{ display: 'flex' }}>
      <ScrollArea
        {...props}
        style={{ flexGrow: 1, maxHeight: fixedTheme.fieldMaxHeight, ...props.style }}
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
        {props.children}
      </ScrollArea>
    </div>
  )
}