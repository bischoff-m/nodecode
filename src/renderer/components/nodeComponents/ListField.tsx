import type { FieldProps } from '@/types/util';
import { ActionIcon, CloseButton, createStyles, Stack, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons';
import { useState } from 'react';

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: '#262626',
    borderRadius: theme.radius.md, // TODO: use this for other properties as well
    boxShadow: 'inset 0px 0px 3px rgb(0 0 0 / 40%)',
  },
  label: {
    paddingTop: 5,
    paddingLeft: 10,
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 5,
    height: 30,
    '& > div': {
      width: '100%',
      fontWeight: 300,
      fontSize: 14,
    }
  },
}));

// TODO: add maximum height and scroll container to list
// TODO: implement props: label, defaultItems, placeholder(?)

type ListFieldProps = {
  label?: string,
} & FieldProps

export default function ListField(props: ListFieldProps) {
  const { classes } = useStyles();
  const [listItems, setListItems] = useState<string[]>(['charttime', 'terseform', 'unitofmeasure']);
  const [inputValue, setInputValue] = useState('');

  function handleAddItem() {
    if (inputValue.trim() !== '') {
      setListItems([inputValue, ...listItems])
      setInputValue('')
    }
  }
  const addButton = (
    <ActionIcon
      onClick={() => console.log('hi')}
      variant='hover'
    ><IconPlus size={18} /></ActionIcon>
  )
  // TODO: replace content by an actual option to set a label
  const label = <div className={classes.label}>{props.label ? props.label : 'List'}</div>

  return (
    <div className={classes.container}>
      <TextInput
        value={inputValue}
        onKeyDown={(event) => event.key === 'Enter' && handleAddItem()}
        onChange={(event) => setInputValue(event.target.value)}
        rightSection={addButton}
        variant='default'
        label={label}
        // label={props.label ? label : undefined} // TODO: use this once label is implemented
      />
      <Stack spacing={0}>
        {
          listItems.map((item, i) =>
            <div key={i} className={classes.listItem}>
              <div>{item}</div>
              <CloseButton onClick={() => setListItems(listItems.slice(0, i).concat(listItems.slice(i + 1)))} />
            </div>
          )
        }
      </Stack>
    </div>
  )
}