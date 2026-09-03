/**
 * Phần nối chế độ thực nghiệm vào trang (việc C3.1).
 *
 * Tách khỏi tệp điểm vào vì bốn quyết định dưới đây **sai thì hỏng cả bộ dữ liệu
 * mà không để lại dấu vết nào trong log** — đúng loại việc phải có test:
 *
 *  1. Số thứ tự người tham gia do người nghiên cứu cấp, **không có giá trị mặc
 *     định**. Mặc định 0 là ai cũng nghe cùng một thứ tự, phép đảo thứ tự cân
 *     bằng của `assignment.js` biến mất, và log trông vẫn bình thường.
 *  2. Tên tệp phục vụ phải **mờ**, và kiểm ngay lúc nạp bảng kê — nổ trước khi
 *     hỏi đồng thuận, chứ không nổ giữa lúc người ta đang ngồi trước máy.
 *  3. Thiếu tệp thì chặn **trước khi bắt đầu**, không để đến lượt thứ ba mới 404.
 *  4. Rời trang giữa chừng là mất phiên, nên hỏi lại.
 */

/** Tham số URL mang số thứ tự người tham gia. Người nghiên cứu cấp, không tự sinh. */
const PARTICIPANT_PARAM = 'nguoi';

/**
 * @param {string} search phần `?…` của địa chỉ
 * @returns {number}
 */
export function resolveParticipantIndex(search) {
  const raw = new URLSearchParams(search).get(PARTICIPANT_PARAM);
  if (raw === null || raw === '') {
    throw new Error(
      `Thiếu tham số "?${PARTICIPANT_PARAM}=" trên địa chỉ. Số thứ tự người tham gia do người ` +
        'nghiên cứu cấp theo danh sách tuyển (việc C3.2), vì nó quyết định thứ tự nghe và ' +
        'điều kiện của phiên. Không có giá trị mặc định: mặc định 0 thì ai cũng nghe cùng ' +
        'một thứ tự và phép đảo thứ tự cân bằng mất mà không ai biết.',
    );
  }
  // Chặn "1.5", "1e3", " 1 " — `Number` nhận hết, và một số thứ tự sai kiểu sẽ
  // rơi vào ô Latin vuông của người khác.
  if (!/^\d+$/.test(raw)) {
    throw new Error(`"?${PARTICIPANT_PARAM}=${raw}" không phải số nguyên không âm.`);
  }
  return Number(raw);
}

/**
 * Bảng kê có đặt tên tệp lộ đáp án không.
 *
 * `render-stimuli.mjs` đặt tên theo băm nội dung, nên bình thường sẽ không lộ.
 * Kiểm lại ở đây phòng khi bảng kê được sinh bằng cách khác — và kiểm **lúc nạp**
 * để lỗi nổ ra trước khi có người tham gia nào ngồi vào.
 */
function assertOpaque(stimuli) {
  for (const item of stimuli) {
    const secrets = [
      ['mã kịch bản', item.id],
      ['mã bản trộn', item.recipe_id],
      ['mã địa điểm', item.location_id],
      ['điều kiện', item.condition],
    ];
    for (const [what, secret] of secrets) {
      if (secret && item.served_as?.includes(secret)) {
        throw new Error(
          `Bảng kê đặt tên tệp "${item.served_as}" để lộ ${what} ("${secret}"). Người tham gia ` +
            'mở tab mạng là đoán được đáp án. Chạy lại `npm run render:stimuli` — bản kết xuất ' +
            'đặt tên theo băm nội dung chính vì lý do này.',
        );
      }
    }
  }
}

/**
 * @param {{stimuli: object[]}} manifest nội dung `build/stimuli/manifest.json`
 * @param {{base?: string}} [options]
 * @returns {(stimulusId: string) => string}
 */
export function createStimulusUrl(manifest, { base = '/stimuli/' } = {}) {
  const stimuli = manifest?.stimuli ?? [];
  assertOpaque(stimuli);
  const served = new Map(stimuli.map((item) => [item.id, item.served_as]));

  return (stimulusId) => {
    const name = served.get(stimulusId);
    if (!name) {
      throw new Error(
        `Không có "${stimulusId}" trong bảng kê kích thích. Chạy \`npm run render:stimuli\` ` +
          'để kết xuất lại.',
      );
    }
    return `${base}${name}`;
  };
}

/**
 * Mọi cặp (bản trộn × điều kiện) đều có tệp chưa.
 *
 * Kiểm cả thiết kế chứ không chỉ bốn lượt của người này: thiếu tệp mà phát hiện
 * ở người thứ mười hai thì mười một người trước đã nghe xong rồi.
 */
export function assertStimuliAvailable(manifest, recipes, conditions) {
  const have = new Set((manifest?.stimuli ?? []).map((item) => item.id));
  const missing = [];
  for (const recipe of recipes) {
    for (const condition of conditions) {
      const id = `${recipe.id}--${condition}`;
      if (!have.has(id)) missing.push(id);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Thiếu ${missing.length} tệp kích thích: ${missing.join(', ')}. Chạy ` +
        '`npm run render:stimuli` trước khi mời người tham gia.',
    );
  }
}

/** Tên tệp log — đệm 0 để sắp xếp theo tên ra đúng thứ tự số. */
export const logFilename = (log) => `nguoi-${String(log.participant_index).padStart(3, '0')}.json`;

/**
 * Hỏi lại khi rời trang giữa phiên.
 *
 * Không giữ được phiên qua lần tải lại: tải lại là bắt đầu từ đầu, mà người đó đã
 * nghe rồi nên các lượt sau không còn đo cùng một thứ. Thà hỏi lại còn hơn mất
 * lặng lẽ một người tham gia.
 *
 * @returns {() => void} hàm gỡ
 */
export function attachExitGuard(win, session) {
  const onBeforeUnload = (event) => {
    if (session.state() !== 'trial') return;
    event.preventDefault();
    event.returnValue = '';
  };
  win.addEventListener('beforeunload', onBeforeUnload);
  return () => win.removeEventListener('beforeunload', onBeforeUnload);
}
