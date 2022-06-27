import { DataGridSelectModeType } from './types';

export function convertEventToSelectMode(
  event: React.KeyboardEvent | React.MouseEvent
): DataGridSelectModeType {
  if (event.shiftKey) {
    return 'range';
  }

  if (event.metaKey) {
    return 'multiple';
  }

  return 'single';
}
