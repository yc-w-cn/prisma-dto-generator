import { onGenerate } from './utils/mock-generate';

describe('生成器集成', () => {
  test('模拟onGenerate运行', async () => {
    await onGenerate();
  });
});
