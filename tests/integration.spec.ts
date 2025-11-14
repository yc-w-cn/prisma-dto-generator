import { onGenerate } from './utils/mock-generate';

describe('generator integration', () => {
  test('mock onGenerate runs', async () => {
    await onGenerate();
  });
});
