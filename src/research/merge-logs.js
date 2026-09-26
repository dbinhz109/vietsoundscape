/**
 * Gộp log của nhiều người tham gia thành một bộ dữ liệu để phân tích.
 *
 * **Vì sao cần.** Trang phiên nghe cho **mỗi người tải về một tệp riêng**
 * (`nguoi-007.json`), nên đến lúc phân tích nhóm sẽ có 96 tệp chứ không phải
 * một. Trước đây `npm run analyse` chỉ đọc đối số đầu tiên và **im lặng** báo
 * n = 1 — lỗi tìm được khi diễn tập trọn đường ống ngày 21/09, trước khi tuyển
 * người. Im lặng là phần tệ nhất: một bảng kết quả với n = 1 trông vẫn "chạy".
 *
 * Ba thứ gộp phải chặn cứng vì chúng làm hỏng phân tích mà không báo lỗi:
 * trùng mã người (phân điều kiện dựa trên mã), lẫn hai thiết kế, và đổi bộ câu
 * hỏi giữa chừng.
 */

/**
 * @typedef {object} ParticipantLog
 * @property {string} [design]
 * @property {string[]} [likert_fields]
 * @property {number} [participant_index]
 * @property {boolean} [complete]
 * @property {Array<object>} trials
 */

/**
 * @param {ParticipantLog[]} logs
 * @returns {{ design: string, likert_fields: string[], trials: object[], sources: number,
 *            excluded: Array<{participant_index: number | undefined, reason: string}> }}
 */
export function mergeParticipantLogs(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    throw new Error('Không có tệp log nào để gộp.');
  }

  const modes = new Set(logs.map((log) => log.synthetic === true));
  if (modes.size > 1) throw new Error('Không gộp log giả lập với log thật. Hãy chọn riêng thư mục.');
  const versions = new Set(logs.map((log) => log.dataset_version ?? 'legacy'));
  if (versions.size > 1) throw new Error('Không gộp log của các phiên bản bộ dữ liệu khác nhau.');

  const excluded = [];
  const trials = [];
  const seen = new Map();
  let design;
  let likertFields;

  logs.forEach((log, fileIndex) => {
    const where = log.participant_index ?? `tệp thứ ${fileIndex + 1}`;

    if (design === undefined) design = log.design;
    else if (log.design !== undefined && log.design !== design) {
      throw new Error(
        `Lẫn hai thiết kế: "${design}" và "${log.design}" (${where}). Gộp lại là kiểm định sai — ` +
          'ghép cặp trong-người không áp được cho dữ liệu giữa-người.',
      );
    }

    const fields = log.likert_fields;
    if (fields !== undefined) {
      if (likertFields === undefined) likertFields = [...fields];
      else if (fields.length !== likertFields.length || fields.some((f, i) => f !== likertFields[i])) {
        throw new Error(
          `Danh sách thuộc tính khác nhau giữa các tệp (${where}): bộ câu hỏi đã đổi giữa chừng, ` +
            'nên hai nửa mẫu đang đo hai thứ khác nhau. Xem kế hoạch phân tích §7 trước khi gộp.',
        );
      }
    }

    const own = Array.isArray(log.trials) ? log.trials : [];
    if (own.length === 0) {
      excluded.push({ participant_index: log.participant_index, reason: 'không có lượt nghe nào' });
      return;
    }
    // Tiêu chí loại của kế hoạch phân tích §3, luật máy: phiên không hoàn tất.
    // Chỉ áp khi tệp có khai `complete` — tệp gộp sẵn nhiều người thì không có.
    if (log.complete === false) {
      excluded.push({ participant_index: log.participant_index, reason: 'phiên không hoàn tất' });
      return;
    }

    for (const trial of own) {
      const index = trial.participant_index ?? log.participant_index;
      const previous = seen.get(index);
      if (previous !== undefined && previous !== fileIndex) {
        throw new Error(
          `Mã người tham gia ${index} trùng ở hai tệp. Mã quyết định điều kiện được phân, nên hai ` +
            'người cùng mã là hỏng cân bằng — đổi mã rồi gộp lại, đừng bỏ bớt một tệp.',
        );
      }
      seen.set(index, fileIndex);
      trials.push(trial);
    }
  });

  trials.sort(
    (a, b) => (a.participant_index ?? 0) - (b.participant_index ?? 0) || (a.order ?? 0) - (b.order ?? 0),
  );

  return {
    design: design ?? 'within-subject',
    likert_fields: likertFields ?? [],
    trials,
    sources: logs.length,
    synthetic: logs[0].synthetic === true,
    dataset_version: logs[0].dataset_version,
    excluded,
  };
}
