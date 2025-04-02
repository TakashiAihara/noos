import { describe, expect, it } from 'vitest';
import { mask } from '.';

describe('mask', () => {
  type TestCase = {
    input: string | null | undefined;
    expected: string;
    description: string;
    maskChar?: string;
  };

  const basicTestCases: TestCase[] = [
    { input: 'a', expected: '*', description: '1文字' },
    { input: 'ab', expected: '**', description: '2文字' },
    { input: 'abc', expected: 'a*c', description: '3文字' },
    { input: '1234', expected: '1**4', description: '4文字' },
    { input: 'abcdefgh', expected: 'a******h', description: '8文字' },
    { input: '1234567890', expected: '1********0', description: '10文字' },
    { input: '1234567890ab', expected: '1**********b', description: '12文字' },
    { input: '1234567890abcdef', expected: '12************ef', description: '16文字' },
    {
      input: 'abcdefghijklmnopqrstuvwxyz1234567890',
      expected: 'abc******************************890',
      description: '36文字',
    },
    {
      input: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl',
      expected: 'abcd********************************************************ijkl',
      description: '64文字',
    },
  ];

  const customMaskTestCases: TestCase[] = [
    { input: 'abcdefgh', maskChar: '#', expected: 'a######h', description: '# マスク文字' },
    { input: '12345678', maskChar: '●', expected: '1●●●●●●8', description: '● マスク文字' },
    { input: 'password', maskChar: '■', expected: 'p■■■■■■d', description: '■ マスク文字' },
  ];

  const edgeTestCases: TestCase[] = [
    { input: null, expected: '', description: 'null入力' },
    { input: undefined, expected: '', description: 'undefined入力' },
    { input: '', expected: '', description: '空文字列' },
  ];

  it.each<TestCase>([...basicTestCases, ...customMaskTestCases, ...edgeTestCases])(
    'Case $description: masked $input with $maskChar -> "$expected"',
    ({ expected, input, maskChar }) => {
      expect(mask({ input, maskChar })).toBe(expected);
    },
  );
});
