/** Express 5 can type route params as string | string[] */
export function routeParam(value: string | string[] | undefined, name = 'id'): string {
  if (value == null) throw new Error(`Missing route param ${name}`)
  return Array.isArray(value) ? value[0]! : value
}
