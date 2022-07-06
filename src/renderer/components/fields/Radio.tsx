import { useState } from 'react'
import { createStyles, Radio, RadioGroup, useMantineTheme } from '@mantine/core'
import type { FieldProps } from '@/types/util'
import type { RadioFieldProps } from '@/types/NodeCollection'
import FieldBase from '@/components/util/FieldBase'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { fixedTheme } from '@/styles/themeCanvas'

const useStyles = createStyles((theme) => ({
  container: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 5,
  },
  item: {
    height: fixedTheme.fieldDefaultHeight,
  }
}))

// TODO: if props.defaultValue is not set: add check before running node-program, whether every field has a valid state

export default function RadioField(props: RadioFieldProps & FieldProps) {
  if (Object.keys(props.valueLabelPairs).length === 0)
    throw new Error('RadioField: valueLabelPairs is empty')
  if (props.defaultValue && !(props.defaultValue in props.valueLabelPairs))
    throw new Error('RadioField: defaultValue is not included in valueLabelPairs')

  const { classes } = useStyles()
  const theme = useMantineTheme()
  const [value, setValue] = useState<string>(props.defaultValue ? props.defaultValue : '')

  return (
    <FieldBase label={props.label}>
      <MaxHeightScrollArea>
        <RadioGroup
          value={value}
          onChange={setValue}
          orientation='vertical'
          spacing={0}
          className={classes.container}
          styles={{
            label: {
              fontSize: theme.fontSizes.md,
              color: theme.other.textColor,
            }
          }}
        >
          {Object.keys(props.valueLabelPairs).map(key => (
            <Radio
              key={key}
              value={key}
              label={props.valueLabelPairs[key]}
              className={classes.item}
            />
          ))}
        </RadioGroup>
      </MaxHeightScrollArea>
    </FieldBase>
  )
}