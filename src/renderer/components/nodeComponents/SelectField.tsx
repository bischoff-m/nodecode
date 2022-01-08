import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import type {FieldProps} from '@/types/util';


type SelectFieldProps = {
  values?: string[],
  default?: string,
  label?: string,
} & FieldProps // TODO: is this really needed? (maybe to refer to JSON when <Select> value changes)

export default function SelectField(props: SelectFieldProps) {
  const [value, setValue] = useState(props.default);

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  return (
    <FormControl fullWidth size='small'>
      <InputLabel id="label">{props.label}</InputLabel>
      <Select
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
  )
}