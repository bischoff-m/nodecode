import { fixedTheme } from '@/styles/themeCanvas'
import {
  ActionIcon,
  CloseButton,
  createStyles,
  Stack,
  TextInput,
  useMantineTheme,
} from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons'
import { useState } from 'react'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import type { FieldProps } from '@/types/util'
import type { ListFieldProps } from '@/types/NodeCollection'

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.other.fieldBackgroundColor,
    borderRadius: theme.radius[fixedTheme.fieldContainerRadius],
    border: theme.other.fieldBorder,
    boxShadow: theme.other.fieldContainerShadow,
    paddingBottom: fixedTheme.fieldInnerMargin,
  },
  input: {
    marginLeft: fixedTheme.fieldInnerMargin,
    marginRight: fixedTheme.fieldInnerMargin,
  },
  label: {
    padding: 5,
    paddingLeft: fixedTheme.fieldLabelMargin,
    fontSize: theme.fontSizes.lg,
    color: theme.other.textColor,
    fontWeight: 500,
  },
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

export default function ListField(props: ListFieldProps & FieldProps) {
  const { classes } = useStyles()
  const theme = useMantineTheme()

  const [listItems, listHandlers] = useListState<string>([])
  const [inputValue, setInputValue] = useState('')

  function handleAddItem() {
    const trimmed = inputValue.trim()
    if (trimmed !== '') {
      listHandlers.prepend(trimmed)
      setInputValue('')
    }
  }
  const addButton = (
    <ActionIcon onClick={() => handleAddItem()} variant="hover">
      <IconPlus size={fixedTheme.iconSize} color={theme.other.iconColor} />
    </ActionIcon>
  )
  const label = <div className={classes.label}>{props.label}</div>

  return (
    <div className={classes.container}>
      {props.label ? label : undefined}
      <TextInput
        className={classes.input}
        value={inputValue}
        onKeyDown={(event) => event.key === 'Enter' && handleAddItem()}
        onChange={(event) => setInputValue(event.target.value)}
        rightSection={addButton}
        variant="filled"
        placeholder={props.placeholder}
        style={{ marginBottom: listItems.length > 0 ? 3 : 0 }}
      />
      <MaxHeightScrollArea>
        <Stack spacing={0}>
          {listItems.map((item, i) => (
            <div key={i} className={classes.listItem}>
              <CloseButton
                onClick={() => listHandlers.remove(i)}
                iconSize={fixedTheme.iconSize}
                style={{ color: theme.other.iconColor }}
              />
              <div>{item}</div>
            </div>
          ))}
        </Stack>
      </MaxHeightScrollArea>
    </div>
  )
}