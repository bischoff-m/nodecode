import { useState } from 'react'
import { MultiSelect, useMantineTheme } from '@mantine/core'
import type { FieldProps } from '@/types/util'
import type { MultiSelectFieldProps } from '@/types/NodeCollection'
import FieldBase from '@/components/util/FieldBase'


export default function MultiSelectField(props: MultiSelectFieldProps & FieldProps) {
  if (Object.keys(props.valueLabelPairs).length === 0)
    throw new Error('MultiSelectField: valueLabelPairs is empty')

  const theme = useMantineTheme()
  const [selected, setSelected] = useState<string[]>([])

  const data = Object.keys(props.valueLabelPairs).map(value => (
    { value, label: props.valueLabelPairs[value] }
  ))

  return (
    <FieldBase label={props.label}>
      <MultiSelect
        data={data}
        value={selected}
        onChange={setSelected}
        placeholder={props.placeholder}
        variant={theme.other.fieldComponentVariant}
        searchable
        nothingFound="No results found"
        limit={20}
        clearable
        styles={{
          value: {
            backgroundColor: theme.other.nodeBackgroundColor,
          },
          searchInput: {
            '&::placeholder': {
              fontFamily: theme.fontFamily,
              fontSize: theme.fontSizes.md,
              transform: 'translateY(0.12em)',
            },
          }
        }}
      />
    </FieldBase>
  )
}