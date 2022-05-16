import type { FieldProps } from '@/types/util';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close'; // TODO: switch to https://mantine.dev/core/action-icon/ with tabler icons
import { Theme } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import { makeStyles } from '@mui/styles';
import { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: 5,
    backgroundColor: '#262626',
    borderRadius: theme.shape.borderRadius,
    boxShadow: 'inset 0px 0px 3px rgb(0 0 0 / 40%)',
  },
  input: {
    height: 35,
    backgroundColor: '#262626',
    '& button': {
      width: 30,
      height: 30,
      borderRadius: theme.shape.borderRadius,
    },
  },
  listItem: {
    height: 35,
    '& > div': {
      right: 5,
    },
    '& button': {
      width: 30,
      height: 30,
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

type ListFieldProps = {

} & FieldProps

export default function ListField(props: ListFieldProps) {
  const classes = useStyles();
  const [listItems, setListItems] = useState<string[]>(['charttime', 'terseform', 'unitofmeasure']);
  const [inputValue, setInputValue] = useState('');

  function handleAddItem() {
    if (inputValue.trim() !== '') {
      setListItems([inputValue, ...listItems])
      setInputValue('')
    }
  }

  return (
    <div className={classes.container}>
      <FormControl fullWidth variant='outlined' size='small'>
        <InputLabel shrink htmlFor='outlined-adornment-password'>List</InputLabel>
        <OutlinedInput
          className={classes.input}
          id='outlined-adornment-password' // TODO: change
          label='List'
          value={inputValue}
          onKeyDown={(event: ReactKeyboardEvent) => event.key === 'Enter' && handleAddItem()}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
          notched
          endAdornment={
            <InputAdornment position='end'>
              <IconButton onClick={handleAddItem} edge='end'>
                <AddIcon />
              </IconButton>
            </InputAdornment>
          }
        />
        <List dense disablePadding sx={{ paddingTop: listItems.length > 0 ? '3px' : '0px' }}>
          {
            listItems.map((item, i) =>
              <ListItem
                key={i}
                className={classes.listItem}
                secondaryAction={
                  <IconButton
                    edge='end'
                    onClick={() => setListItems(listItems.slice(0, i).concat(listItems.slice(i + 1)))}
                    size='small'
                  >
                    <CloseIcon />
                  </IconButton>
                }
              >
                {item}
              </ListItem>
            )
          }
        </List>
      </FormControl>
    </div>
  )
}