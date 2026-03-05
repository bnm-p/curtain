import { useMDXComponents as getNextraMDXComponents } from 'nextra-theme-docs'

export function useMDXComponents(components: Record<string, React.ComponentType>) {
  return {
    ...getNextraMDXComponents(components),
    ...components,
  }
}
