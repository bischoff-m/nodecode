import {
  ActionIcon,
  CloseButton,
  createStyles,
  Stack,
  TextInput,
  useMantineTheme,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons'
import { useState } from 'react'
import FieldBase, { useFieldState } from '@/components/util/FieldBase'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { fixedTheme } from '@/styles/themeCanvas'
import type { ListFieldProps } from '@/types/NodePackage'
import type { ListFieldState } from '@/types/NodeProgram'
import type { FieldProps } from '@/types/util'

const useStyles = createStyles((theme) => ({
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: fixedTheme.fieldInnerMargin,
    paddingRight: fixedTheme.fieldInnerMargin,
    height: fixedTheme.fieldDefaultHeight,
    '& > div': {
      width: '100%',
      fontSize: theme.fontSizes.md,
      color: theme.other.textColor,
      paddingLeft: 3,
    },
  },
}))

// TODO: make labels wrap if they are too long, to avoid horizontal scrollbar which blocks last element

export default function ListField(props: ListFieldProps & FieldProps) {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const [inputValue, setInputValue] = useState('')
  const [listItems, setListItems] = useFieldState<ListFieldState>(
    [],
    props.nodeKey,
    props.fieldKey,
  )

  function handleAddItem() {
    const trimmed = inputValue.trim()
    if (trimmed !== '') {
      setListItems([trimmed, ...listItems])
      setInputValue('')
    }
  }
  const addButton = (
    <ActionIcon onClick={() => handleAddItem()} variant="hover">
      <IconPlus size={fixedTheme.iconSize} color={theme.other.iconColor} />
    </ActionIcon>
  )

  return (
    <FieldBase label={props.label}>
      <TextInput
        value={inputValue}
        onKeyDown={(event) => event.key === 'Enter' && handleAddItem()}
        onChange={(event) => setInputValue(event.target.value)}
        rightSection={addButton}
        variant="filled"
        placeholder={props.placeholder}
        style={{ marginBottom: listItems.length > 0 ? 3 : 0 }}
        wrapperProps={{ spellCheck: false }}
      />
      <MaxHeightScrollArea scrollAreaProps={{ offsetScrollbars: true }}>
        <Stack spacing={0}>
          {listItems.map((item, i) => (
            <div key={i} className={classes.listItem}>
              <CloseButton
                onClick={() => setListItems(listItems.filter((_, j) => j !== i))}
                iconSize={fixedTheme.iconSize}
                style={{ color: theme.other.iconColor }}
              />
              <div>{item}</div>
            </div>
          ))}
        </Stack>
      </MaxHeightScrollArea>
    </FieldBase>
  )
}