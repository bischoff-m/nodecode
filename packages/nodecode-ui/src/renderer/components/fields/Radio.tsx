import { createStyles, Radio, RadioGroup, useMantineTheme } from '@mantine/core'
import { useEffect } from 'react'
import FieldBase from '@/components/util/FieldBase'
import MaxHeightScrollArea from '@/components/util/MaxHeightScrollArea'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import { setFieldState } from '@/redux/programSlice'
import { fixedTheme } from '@/styles/themeCanvas'
import type { RadioFieldProps } from '@/types/NodePackage'
import type { RadioFieldState } from '@/types/NodeProgram'
import type { FieldProps } from '@/types/util'

const useStyles = createStyles(() => ({
  container: {
    paddingLeft: 8,
    paddingRight: 8,
    '& > .mantine-Group-root': {
      paddingTop: '0px !important',
    },
  },
  item: {
    height: fixedTheme.fieldDefaultHeight,
  }
}))

export default function RadioField(props: RadioFieldProps & FieldProps) {
  if (Object.keys(props.valueLabelPairs).length === 0)
    throw new Error('RadioField: valueLabelPairs is empty')
  if (props.defaultValue && !(props.defaultValue in props.valueLabelPairs))
    throw new Error('RadioField: defaultValue is not included in valueLabelPairs')

  const { classes } = useStyles()
  const theme = useMantineTheme()
  const dispatch = useDispatchTyped()
  const selectedValue = useSelectorTyped(
    state => state
      .program
      .nodes[props.nodeKey]
      .state[props.fieldKey] as RadioFieldState
  )

  const setState = (state: RadioFieldState) => dispatch(setFieldState({
    nodeKey: props.nodeKey,
    fieldKey: props.fieldKey,
    fieldState: state,
  }))

  useEffect(() => {
    !selectedValue && setState(
      props.defaultValue
        ? props.defaultValue
        : Object.keys(props.valueLabelPairs)[0]
    )
  }, [])

  return (
    <FieldBase label={props.label}>
      <MaxHeightScrollArea scrollAreaProps={{ offsetScrollbars: true }}>
        <RadioGroup
          value={selectedValue}
          onChange={setState}
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