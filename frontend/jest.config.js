module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(react-markdown|vfile|vfile-message|unified|bail|is-plain-obj|trough|remark-parse|mdast-util-from-markdown|mdast-util-to-string|micromark.*|decode-named-character-reference|character-entities|property-information|hast-util-whitespace|remark-rehype|mdast-util-to-hast|unist-builder|unist-util-visit|unist-util-is|unist-util-position|generated|space-separated-tokens|comma-separated-tokens|vfile-location|web-namespaces|hast-to-hyperscript)/)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
    "^.+\\.(js|jsx|mjs)$": "ts-jest"
  }
};
