import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import type { FieldProps } from '@/types/util';
import { createStyles } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  container: {
    height: 40,
    paddingTop: 5,
  },
  select: {
    height: 35,
    backgroundColor: '#262626', // TODO: add to theme
  },
}));

// TODO: close dropdown when canvas is moved or scaled (or move and scale dropdown as well?)
// TODO: These props should be required. Is there a way to define is in nodeCollection.schema.json?
type SelectFieldProps = {
  values?: string[],
  default?: string,
  label?: string,
} & FieldProps

export default function SelectField(props: SelectFieldProps) {
  const { classes } = useStyles();
  const [value, setValue] = useState(props.default);

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  return (
    <div className={classes.container}>
      <FormControl fullWidth size='small'>
        <InputLabel id="label">{props.label}</InputLabel>
        <Select
          className={classes.select}
          labelId="label"
          id="select"
          value={value}
          label={props.label}
          onChange={handleChange}
        >
          {
            props.values?.map((val, i) =>
              <MenuItem key={i} value={val}>
                {val}
              </MenuItem>
            )
          }
        </Select>
      </FormControl>
    </div>
  )
}