/** Assert that a string is well-formed SVG (basic structural checks) */
export function assertValidSvg(svg: string): void {
  expect(svg).toMatch(/^<svg\s/);
  expect(svg).toMatch(/<\/svg>$/);
  expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain('role="img"');
}

/** Assert SVG contains accessible title/desc */
export function assertAccessibleSvg(svg: string, titleText?: string): void {
  expect(svg).toContain("<title");
  expect(svg).toContain("<desc");
  if (titleText) {
    expect(svg).toContain(titleText);
  }
}