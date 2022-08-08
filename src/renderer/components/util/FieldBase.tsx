import { createStyles } from '@mantine/core'
import { fixedTheme } from '@/styles/themeCanvas'
import type { FieldState } from '@/types/NodeProgram'
import { useDispatchTyped, useSelectorTyped } from '@/redux/hooks'
import { setFieldState } from '@/redux/programSlice'
import { useEffect } from 'react'


const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.other.fieldBackgroundColor,
    borderRadius: theme.radius[fixedTheme.fieldContainerRadius],
    border: theme.other.fieldBorder,
    boxShadow: theme.other.fieldContainerShadow,
    padding: fixedTheme.fieldInnerMargin,
  },
  label: {
    padding: 5,
    paddingLeft: fixedTheme.fieldLabelMargin,
    fontSize: theme.fontSizes.lg,
    color: theme.other.textColor,
    fontWeight: 500,
  },
}))

type FieldBaseProps = {
  children?: React.ReactNode
  label?: string
}

export default function FieldBase(props: FieldBaseProps) {
  const { classes } = useStyles()

  const label = <div className={classes.label}>{props.label}</div>
  return (
    <div className={classes.container}>
      {props.label ? label : undefined}
      {props.children}
    </div>
  )
}


export function useFieldState<T extends FieldState>(
  defaultValue: T,
  nodeKey: string,
  fieldKey: string,
): [T, (state: T) => void] {
  const selectedValue = useSelectorTyped(
    state => state
      .program
      .nodes[nodeKey]
      .state[fieldKey] as T
  )

  const dispatch = useDispatchTyped()
  const setState = (state: T) => dispatch(setFieldState({
    nodeKey: nodeKey,
    fieldKey: fieldKey,
    fieldState: state,
  }))

  useEffect(() => {
    !selectedValue && setState(defaultValue)
  }, [])

  return [selectedValue !== undefined ? selectedValue : defaultValue, setState]
}