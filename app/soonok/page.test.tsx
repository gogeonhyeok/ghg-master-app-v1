import { fireEvent, render, screen } from '@testing-library/react';
import Page from './page';
import diaryEntries from './diaryEntries';

test('every diary entry includes a Chinese translation and preserves numeric diary data', () => {
  for (const entry of diaryEntries) {
    expect(entry.zh.note.trim()).not.toBe('');
    expect(entry.zh.day).toMatch(/^周[一二三四五六日]$/);
    if (entry.work) expect(entry.zh.work).not.toBe('');
    const weights = entry.note.match(/\d+(?:\.\d+)?\s*kg/g) ?? [];
    for (const weight of weights) expect(entry.zh.note).toContain(weight);
    const amounts = entry.note.match(/\d{1,3}(?:,\d{3})+/g) ?? [];
    for (const amount of amounts) expect(entry.zh.note).toContain(amount);
  }
});

test('switches languages while preserving search and year filters', () => {
  render(<Page />);
  expect(screen.getByRole('heading', { name: '나의 기록' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '2023' }));
  fireEvent.click(screen.getByRole('button', { name: '中文' }));
  expect(screen.getByRole('heading', { name: '我的日记' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '中文' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getAllByRole('article')).toHaveLength(3);
  fireEvent.change(screen.getByRole('textbox', { name: '搜索日记' }), { target: { value: '肋侧' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByText(/肋侧像是肌肉痉挛/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '한국어' }));
  expect(screen.getByText(/옆구리 담 걸린데/)).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('肋侧');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'no matching entry' } });
  expect(screen.getByText('찾으시는 기록이 없어요.')).toBeInTheDocument();
});


test('English translations cover all entries and preserve weights and amounts', () => {
  for (const entry of diaryEntries) {
    expect(entry.en.note.trim()).not.toBe('');
    expect(entry.en.note).not.toMatch(/[가-힣\u4e00-\u9fff]/);
    expect(entry.en.day).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
    if (entry.work) expect(entry.en.work).not.toBe('');
    for (const value of entry.note.match(/\d+(?:\.\d+)?\s*kg|\d{1,3}(?:,\d{3})+/g) ?? []) {
      expect(entry.en.note).toContain(value);
    }
  }
});

test('starts with light paper and supports English without losing filters or theme', () => {
  render(<Page />);
  expect(screen.getByRole('main')).toHaveAttribute('data-theme', 'light');
  fireEvent.click(screen.getByRole('button', { name: '2023' }));
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByRole('heading', { name: 'My journal' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: '한국어' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getAllByRole('article')).toHaveLength(3);
  fireEvent.change(screen.getByRole('textbox', { name: 'Search entries' }), { target: { value: 'muscle' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(screen.getByText(/My side hurts terribly/)).toHaveAttribute('lang', 'en');
  fireEvent.click(screen.getByRole('button', { name: 'Dark theme' }));
  expect(screen.getByRole('main')).toHaveAttribute('data-theme', 'dark');
  fireEvent.click(screen.getByRole('button', { name: '中文' }));
  expect(screen.getByRole('textbox')).toHaveValue('muscle');
  expect(screen.getByText(/肋侧像是肌肉痉挛/)).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveAttribute('data-theme', 'dark');
});
