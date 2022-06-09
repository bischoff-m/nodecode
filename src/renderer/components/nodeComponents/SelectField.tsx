import { useState } from 'react';
import type { FieldProps } from '@/types/util';
import { createStyles, Select } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: '#262626',
    borderRadius: 10,
    boxShadow: 'inset 0px 0px 3px rgb(0 0 0 / 40%)',
  },
  label: {
    paddingTop: 5,
    paddingLeft: 10,
  },
}));

// TODO: close dropdown when canvas is moved or scaled (or move and scale dropdown as well?)
//        -> better option: use redux to track canvas state and pass canvasOrigin to positionDependencies prop of SelectField
// TODO: These props should be required. Is there a way to define is in nodeCollection.schema.json?
//        -> Yes, define a schema for each possible field?
// TODO: transform "values" prop into value-label pairs to support e.g. timezone selection
type SelectFieldProps = {
  values?: string[],
  default?: string,
  label?: string,
} & FieldProps

export default function SelectField(props: SelectFieldProps) {
  if (!props.values) throw new Error('SelectField: "values" prop is required');
  if (!props.default) throw new Error('SelectField: "default" prop is required');

  const { classes } = useStyles();
  const [value, setValue] = useState<string>(props.default);

  const label = <div className={classes.label}>{props.label}</div>
  return (
    <div className={classes.container}>
      <Select
        value={value}
        onChange={(value) => value && setValue(value)}
        label={props.label ? label : undefined}
        placeholder=''
        variant='default'
        data={props.values.map((value) => ({ value, label: value }))}
      />
    </div>
  )
}