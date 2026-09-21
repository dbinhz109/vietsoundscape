/**
 * Điểm vào của chế độ thực nghiệm — trang `/thuc-nghiem` (việc C3.1).
 *
 * Là **trang riêng**, không phải một chế độ bên trong trang chính, vì hai lý do
 * nghiên cứu chứ không phải lý do kỹ thuật:
 *
 *  · Trang chính hiện `signature_vi` — câu mô tả đặc trưng âm thanh của từng
 *    vùng ("tiếng rao, xe máy, chuông chùa…"). Đó chính là đáp án viết sẵn. Một
 *    trang riêng bảo đảm không có đường nào để chữ đó lọt vào mắt người tham gia.
 *  · Trang chính nạp Leaflet và bản đồ; phiên nghe không cần gì trong đó.
 *
 * Mọi luật nằm ở `session.js` (trình tự, đồng thuận, chấm điểm) và `bootstrap.js`
 * (số thứ tự người tham gia, tra tệp, chặn rời trang). Tệp này chỉ nạp dữ liệu và
 * nối dây.
 */

import '../../styles/tokens.css';
import '../../styles/app.css';
import '../../styles/experiment.css';

import { createExperimentSession } from './session.js';
import { createExperimentView } from './experiment-view.js';
import {
  assertStimuliAvailable,
  attachExitGuard,
  createStimulusUrl,
  logFilename,
  resolveParticipantIndex,
} from './bootstrap.js';
import { EXPERIMENT_CONDITIONS } from '../../domain/taxonomy.js';
import { ISO_ATTRIBUTE_KEYS } from '../../research/soundscape-scale.js';
import { composeAnswerOptions } from '../../research/answer-options.js';
import { registerOfflineSupport } from '../offline/register.js';
import { assetUrl } from '../asset-url.js';

/**
 * Thư mục phục vụ tệp kích thích.
 *
 * 12 kích thích WAV 48k/24-bit ≈ 198 MB, nên **không** gói vào bản dựng web.
 * Phiên nghe chạy tại chỗ bằng máy chủ phát triển, hoặc thư mục này được phục vụ
 * riêng. Xem `BA §10.5`.
 */
const STIMULUS_BASE = '/build/stimuli/';

const json = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không tải được ${url} (${response.status})`);
  return response.json();
};

/** Tải log về máy người nghiên cứu. Chưa có máy chủ nhận dữ liệu — xem C3.2. */
function downloadLog(log) {
  const blob = new Blob([`${JSON.stringify(log, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = logFilename(log);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function fail(error) {
  const box = document.getElementById('experiment-error');
  box.textContent = error.message;
  box.hidden = false;
  document.getElementById('experiment').replaceChildren();
}

async function main() {
  // Chặn trước khi nạp gì: thiếu số thứ tự thì cả phiên vô nghĩa.
  const participantIndex = resolveParticipantIndex(location.search);

  const [locations, recipes, manifest, { distractors }] = await Promise.all([
    json(assetUrl('/data/locations.geojson')),
    json(assetUrl('/data/recipes/index.json')),
    json(assetUrl(`${STIMULUS_BASE}manifest.json`)),
    json(assetUrl('/data/distractors.json')),
  ]);

  const locationIds = locations.features.map((feature) => feature.properties.location_id);

  // Danh sách trả lời = vùng thật + phương án nhiễu (spec S1.1). Ghép ở đây, và
  // nhãn cho MỌI ô đi cùng một bảng — thiếu nhãn là giao diện ném lỗi, vì một ô
  // hiện mã thô là một ô khác các ô còn lại.
  const answerOptions = composeAnswerOptions(
    locationIds,
    distractors.map((d) => d.location_id),
  );
  const optionLabels = Object.fromEntries([
    ...locations.features.map((feature) => [
      feature.properties.location_id,
      feature.properties.name_vi,
    ]),
    ...distractors.map((d) => [d.location_id, d.name_vi]),
  ]);

  // Kiểm cả thiết kế, không chỉ bốn lượt của người này: thiếu tệp mà phát hiện ở
  // người thứ mười hai thì mười một người trước đã nghe xong rồi.
  assertStimuliAvailable(manifest, recipes, EXPERIMENT_CONDITIONS);

  const session = createExperimentSession({
    participantIndex,
    locations: locationIds,
    recipes,
    answerOptions,
    // Danh sách trường của phiên **lấy thẳng từ bộ ISO** mà giao diện dựng câu
    // hỏi, không khai riêng: khai hai chỗ là có ngày phiên đòi một trường mà
    // giao diện không hỏi, và mọi lượt nộp đều ném lỗi giữa buổi.
    likertFields: ISO_ATTRIBUTE_KEYS,
  });

  const releaseGuard = attachExitGuard(window, session);

  createExperimentView(document.getElementById('experiment'), {
    session,
    optionLabels,
    stimulusUrl: createStimulusUrl(manifest, { base: assetUrl(STIMULUS_BASE) }),
    onComplete: (log) => {
      releaseGuard();
      downloadLog(log);
    },
  });
}

main().catch(fail);

// Vỏ trang phiên nghe cũng cất được để mở lại không cần mạng (A5.1).
registerOfflineSupport({ swUrl: assetUrl('/sw.js') });
