import { fixedTheme } from '@/styles/theme_canvas'
import type { FieldProps } from '@/types/util'
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
    marginBottom: 4,
  },
  label: {
    padding: 5,
    paddingLeft: fixedTheme.fieldLabelMargin,
    fontSize: theme.fontSizes.lg,
    color: theme.other.textColor,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: fixedTheme.fieldInnerMargin + 6,
    paddingRight: fixedTheme.fieldInnerMargin,
    height: fixedTheme.fieldDefaultHeight,
    '& > div': {
      width: '100%',
      fontSize: theme.fontSizes.md,
      color: theme.other.textColor,
    },
  },
}))

// TODO: add maximum height and scroll container to list
// TODO: implement props: label, defaultItems, placeholder(?)

type ListFieldProps = {
  label?: string
} & FieldProps

export default function ListField(props: ListFieldProps) {
  const { classes } = useStyles()
  const theme = useMantineTheme()

  const [listItems, setListItems] = useState<string[]>([
    'charttime',
    'terseform',
    'unitofmeasure',
  ])
  const [inputValue, setInputValue] = useState('')

  function handleAddItem() {
    if (inputValue.trim() !== '') {
      setListItems([inputValue, ...listItems])
      setInputValue('')
    }
  }
  const addButton = (
    <ActionIcon onClick={() => handleAddItem()} variant="hover">
      <IconPlus size={fixedTheme.iconSize} color={theme.other.iconColor} />
    </ActionIcon>
  )
  // TODO: replace content by an actual option to set a label
  const label = (
    <div className={classes.label}>{props.label ? props.label : 'Values'}</div>
  )

  return (
    <div className={classes.container}>
      {label}
      {/* {props.label ? label : undefined} TODO: use this once label is implemented */}
      <TextInput
        className={classes.input}
        value={inputValue}
        onKeyDown={(event) => event.key === 'Enter' && handleAddItem()}
        onChange={(event) => setInputValue(event.target.value)}
        rightSection={addButton}
        variant="filled"
      />
      <Stack spacing={0}>
        {listItems.map((item, i) => (
          <div key={i} className={classes.listItem}>
            <div>{item}</div>
            <CloseButton
              onClick={() => setListItems(listItems.slice(0, i).concat(listItems.slice(i + 1)))}
              iconSize={fixedTheme.iconSize}
              style={{ color: theme.other.iconColor }}
            />
          </div>
        ))}
      </Stack>
    </div>
  )
}