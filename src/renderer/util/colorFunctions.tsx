
export function removeColorTags(shades: {
  '50': string,
  '100': string,
  '200': string,
  '300': string,
  '400': string,
  '500': string,
  '600': string,
  '700': string,
  '800': string,
  '900': string
}): [string, string, string, string, string, string, string, string, string, string] {
  return [
    shades['50'],
    shades['100'],
    shades['200'],
    shades['300'],
    shades['400'],
    shades['500'],
    shades['600'],
    shades['700'],
    shades['800'],
    shades['900']
  ]
}