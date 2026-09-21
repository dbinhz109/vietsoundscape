/**
 * Chọn bản trộn khi một địa điểm có nhiều bản (FR-59 đòi ≥ 3 bản/vùng).
 *
 * Bản trộn là dữ liệu (BA §8.3): cùng một nơi, sáng sớm và đêm là hai không gian
 * âm khác hẳn. Nhóm nút bấm kiểu "đang chọn" (`aria-pressed`) thay cho ô select
 * để người dùng thấy ngay có mấy thời điểm và đang ở đâu. Chỉ một bản thì không
 * dựng gì — không có gì để chọn thì đừng bày nút.
 */

import { TIME_OF_DAY_LABEL, labelOf } from '../../domain/labels.js';

/**
 * @param {object} options
 * @param {Array<{ id: string, title_vi: string, time_of_day?: string }>} options.recipes bản trộn của **một** địa điểm
 * @param {string} options.currentId
 * @param {(recipeId: string) => void} options.onChoose
 * @returns {HTMLElement | null}
 */
export function createRecipeChooser({ recipes, currentId, onChoose }) {
  if (!Array.isArray(recipes) || recipes.length < 2) return null;

  const group = document.createElement('div');
  group.className = 'recipe-chooser';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Chọn bản trộn');

  for (const recipe of recipes) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'recipe-button';
    button.dataset.recipeId = recipe.id;
    button.textContent = labelOf(TIME_OF_DAY_LABEL, recipe.time_of_day);
    button.setAttribute('aria-label', recipe.title_vi);
    button.setAttribute('aria-pressed', String(recipe.id === currentId));
    button.addEventListener('click', () => {
      if (recipe.id === currentId) return;
      onChoose(recipe.id);
    });
    group.append(button);
  }
  return group;
}
