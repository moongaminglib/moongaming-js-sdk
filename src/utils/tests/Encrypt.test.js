const { encode } = require('../Encrypt');

test('encrypt \'abc123\' will be \'YWJjMTIz\'', () => {
  expect(encode('abc123')).toBe('YWJjMTIz');
});
