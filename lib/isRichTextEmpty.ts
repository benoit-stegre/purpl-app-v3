export function isRichTextEmpty(content: string | null | undefined): boolean {
  if (!content) return true
  if (content === '<p></p>') return true
  if (content === '<p><br></p>') return true
  if (content === '<p> </p>') return true
  
  const stripped = content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, '')
    .trim()
  
  return stripped.length === 0
}