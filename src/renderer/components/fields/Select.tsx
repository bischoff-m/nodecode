import { Select, useMantineTheme } from '@mantine/core'
import type { FieldProps } from '@/types/util'
import type { SelectFieldProps } from '@/types/NodePackage'
import FieldBase, { useFieldState } from '@/components/util/FieldBase'
import type { SelectFieldState } from '@/types/NodeProgram'

// TODO: close dropdown when canvas is moved or scaled (or move and scale dropdown as well?)
//        -> better option: use redux to track canvas state and pass canvasOrigin to positionDependencies prop of SelectField
// TODO: transform "values" prop into value-label pairs to support e.g. timezone selection
// TODO: make props.default optional and add placeholder prop when checking for valid field state is implemented

export default function SelectField(props: SelectFieldProps & FieldProps) {
  if (props.values.length === 0)
    throw new Error('SelectField: values is empty')
  if (!props.values.includes(props.default))
    throw new Error('SelectField: default value is not included in values')

  const theme = useMantineTheme()
  const [selectedValue, setSelectedValue] = useFieldState<SelectFieldState>(
    props.default,
    props.nodeKey,
    props.fieldKey,
  )

  return (
    <FieldBase label={props.label}>
      <Select
        value={selectedValue}
        onChange={(value) => value && setSelectedValue(value)}
        data={props.values.map((value) => ({ value, label: value }))}
        placeholder=''
        variant={theme.other.fieldComponentVariant}
      />
    </FieldBase>
  )
}