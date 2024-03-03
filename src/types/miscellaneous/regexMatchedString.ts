export type RegexMatchedString<Pattern extends string> = `${string & {
  __brand: Pattern;
}}`;