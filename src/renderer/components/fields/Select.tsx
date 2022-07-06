import { useState } from 'react'
import { createStyles, Select, useMantineTheme } from '@mantine/core'
import { fixedTheme } from '@/styles/themeCanvas'
import type { FieldProps } from '@/types/util'
import type { SelectFieldProps } from '@/types/NodeCollection'

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.other.fieldBackgroundColor,
    borderRadius: theme.radius[fixedTheme.fieldContainerRadius],
    border: theme.other.fieldBorder,
    boxShadow: theme.other.fieldContainerShadow,
  },
  label: {
    padding: 5,
    paddingLeft: fixedTheme.fieldLabelMargin,
    fontSize: theme.fontSizes.lg,
    color: theme.other.textColor,
    fontWeight: 500,
  },
}))

// TODO: close dropdown when canvas is moved or scaled (or move and scale dropdown as well?)
//        -> better option: use redux to track canvas state and pass canvasOrigin to positionDependencies prop of SelectField
// TODO: transform "values" prop into value-label pairs to support e.g. timezone selection

export default function SelectField(props: SelectFieldProps & FieldProps) {
  const { classes } = useStyles()
  const theme = useMantineTheme()
  const [value, setValue] = useState<string>(props.default)

  const label = <div className={classes.label}>{props.label}</div>
  return (
    <div className={classes.container}>
      {props.label ? label : undefined}
      <Select
        value={value}
        onChange={(value) => value && setValue(value)}
        data={props.values.map((value) => ({ value, label: value }))}
        placeholder=''
        variant={theme.other.fieldComponentVariant}
      />
    </div>
  )
}