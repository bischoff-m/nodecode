import { fixedTheme } from '@/styles/themeCanvas'
import {
  ScrollArea,
  ScrollAreaProps,
  useMantineTheme,
} from '@mantine/core'

type MaxHeightScrollAreaProps = {
  maxHeight?: number,
  scrollAreaProps?: ScrollAreaProps,
} & React.HTMLAttributes<HTMLDivElement>

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