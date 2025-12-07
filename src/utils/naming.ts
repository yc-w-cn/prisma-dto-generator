export function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

export function toPascalCase(input: string): string {
  return (
    input
      .trim()
      // 将驼峰式命名转换为单词分隔的形式
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      // 将下划线、短横线、空格转换为单个空格
      .replace(/[_\-\s]+/g, ' ')
      .split(' ')
      .map((s) => {
        // 将每个单词的首字母大写，其余字母小写
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      })
      .join('')
  );
}
