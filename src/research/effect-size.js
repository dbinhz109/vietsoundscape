/**
 * Cỡ hiệu ứng và khoảng tin cậy (việc C6.2 của lộ trình).
 *
 * ## Vì sao p không đủ
 *
 * `statistics.js` trả lời "hiệu ứng này có thật không". Module này trả lời câu
 * khác và quan trọng không kém: **"nó lớn bao nhiêu, và ta biết con số đó chắc
 * đến đâu"**.
 *
 * Hai câu đó rời nhau. Với n = 48, một hiệu ứng nhỏ đến mức vô nghĩa thực tiễn
 * vẫn có thể ra `p < 0,05`; ngược lại một hiệu ứng lớn vẫn có thể không đạt ý
 * nghĩa vì mẫu bé. Báo cáo chỉ nêu p thì người đọc **không có cách nào** biết
 * mình đang ở trường hợp nào.
 *
 * ## Chọn thước đo nào
 *
 * | Giả thuyết | Cỡ hiệu ứng | Khoảng tin cậy |
 * |---|---|---|
 * | H1, nhị phân ghép cặp | **chênh tỉ lệ** (dễ hiểu) và **tỉ số odds** (so được với tài liệu) | Wald hiệu chỉnh · logit |
 * | H2, thứ bậc ghép cặp | **tương quan rank-biserial** | **Hodges–Lehmann** + CI cắt đuôi phân bố signed-rank |
 *
 * Không dùng Cohen's d cho cả hai: nó giả định thang khoảng và phân bố chuẩn, mà
 * dữ liệu ở đây là nhị phân và thứ bậc.
 *
 * @see BA §10.1 · `statistics.js` cho phần kiểm định ý nghĩa
 */

import { signedRankCounts, wilcoxonSignedRankTest } from './statistics.js';

/** Phân vị chuẩn hai phía cho các mức tin cậy thường dùng. */
const Z_TWO_SIDED = Object.freeze({ 0.1: 1.6448536269, 0.05: 1.959963985, 0.01: 2.5758293035 });

const zFor = (alpha) => {
  const z = Z_TWO_SIDED[alpha];
  if (!z) {
    throw new Error(
      `Chưa có phân vị chuẩn cho α = ${alpha}. Dùng 0,1 · 0,05 · 0,01, hoặc bổ sung vào Z_TWO_SIDED.`,
    );
  }
  return z;
};

const median = (sorted) => {
  const n = sorted.length;
  return n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
};

/**
 * Cỡ hiệu ứng cho H1 — dữ liệu nhị phân ghép cặp.
 *
 * **Chênh tỉ lệ** `(b − c) / n` là con số nên đưa vào kết luận: nó nói thẳng
 * "phân lớp giúp thêm bao nhiêu phần trăm người đoán đúng". **Tỉ số odds** `b / c`
 * so sánh được với tài liệu quốc tế nhưng khó diễn giải cho người đọc phổ thông,
 * nên báo cả hai.
 *
 * Khoảng tin cậy của chênh tỉ lệ mặc định dùng **Wald hiệu chỉnh** (Agresti–Min:
 * thêm 0,5 vào hai ô bất đồng). Bản Wald thuần có tỉ lệ phủ thật **thấp hơn** mức
 * danh nghĩa khi mẫu nhỏ hoặc hiệu ứng gần biên — tức nó cho khoảng **hẹp hơn
 * thực tế**, và hẹp quá là sai theo hướng nguy hiểm. Cả hai đều trả về để đối chiếu.
 *
 * @param {{a: boolean, b: boolean}[]} pairs
 * @param {{alpha?: number}} [options]
 */
export function mcnemarEffect(pairs, options = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('Không có cặp nào để tính cỡ hiệu ứng.');
  }
  const alpha = options.alpha ?? 0.05;
  const z = zFor(alpha);

  const n = pairs.length;
  const b = pairs.filter((pair) => pair.a === true && pair.b === false).length;
  const c = pairs.filter((pair) => pair.a === false && pair.b === true).length;

  const waldInterval = (bb, cc, nn) => {
    const difference = (bb - cc) / nn;
    const variance = (bb + cc - (bb - cc) ** 2 / nn) / nn ** 2;
    const spread = z * Math.sqrt(Math.max(0, variance));
    return { difference, ci: [difference - spread, difference + spread] };
  };

  const wald = waldInterval(b, c, n);
  const adjusted = waldInterval(b + 0.5, c + 0.5, n + 1);

  /** @type {{oddsRatio: number|null, ci: number[]|null, note?: string}} */
  let odds;
  if (b === 0 || c === 0) {
    odds = {
      oddsRatio: b === 0 && c === 0 ? null : b === 0 ? 0 : Number.POSITIVE_INFINITY,
      ci: null,
      note:
        `Một ô bất đồng bằng 0 (b = ${b}, c = ${c}), nên tỉ số odds và khoảng tin cậy logit ` +
        'không xác định. Báo cáo chênh tỉ lệ thay thế, và nêu rõ vì sao thiếu tỉ số odds.',
    };
  } else {
    const logOdds = Math.log(b / c);
    const standardError = Math.sqrt(1 / b + 1 / c);
    odds = {
      oddsRatio: b / c,
      ci: [Math.exp(logOdds - z * standardError), Math.exp(logOdds + z * standardError)],
    };
  }

  return {
    pairs: n,
    b,
    c,
    discordant: b + c,
    alpha,
    riskDifference: adjusted.difference,
    riskDifferenceCi: adjusted.ci,
    riskDifferenceWald: wald.difference,
    riskDifferenceWaldCi: wald.ci,
    ...odds,
  };
}

/** Toàn bộ trung bình Walsh `(dᵢ + dⱼ)/2` với i ≤ j — nền của Hodges–Lehmann. */
function walshAverages(differences) {
  const values = [];
  for (let i = 0; i < differences.length; i += 1) {
    for (let j = i; j < differences.length; j += 1) {
      values.push((differences[i] + differences[j]) / 2);
    }
  }
  return values.sort((x, y) => x - y);
}

/**
 * Cỡ hiệu ứng cho H2 — dữ liệu thứ bậc ghép cặp.
 *
 * **Tương quan rank-biserial** `(W⁺ − W⁻) / (W⁺ + W⁻)` nằm trong [−1, 1] và đọc
 * được ngay: 0 là không hiệu ứng, 1 là mọi cặp đều lệch cùng chiều.
 *
 * **Hodges–Lehmann** là trung vị của toàn bộ trung bình Walsh — ước lượng điểm
 * phi tham số cho độ lệch trung tâm, đi đúng cặp với kiểm định signed-rank. Dùng
 * trung bình mẫu ở đây là quay lại giả định thang khoảng vừa mới tránh.
 *
 * Khoảng tin cậy **cắt đuôi phân bố signed-rank**: bỏ `k` trung bình Walsh ở mỗi
 * đầu, với `k` là số giá trị j thoả `P(W⁺ ≤ j) ≤ α/2`.
 *
 * ### Vì sao không nghịch đảo kiểm định tại các trung bình Walsh
 *
 * Nghịch đảo kiểm định *là* định nghĩa của khoảng tin cậy, nên thoạt trông nó
 * chắc chắn hơn. Nhưng thử **đúng tại** một trung bình Walsh thì có `dᵢ − θ = 0`,
 * cặp đó bị loại, `n` giảm và phép kiểm đổi hẳn. Kết quả là khoảng co lại sai —
 * với thang Likert (tập Walsh chỉ có vài giá trị) nó co thành **một điểm**, mà
 * khoảng tin cậy không bao giờ là một điểm.
 *
 * Đã đối chiếu ba trường hợp: nghịch đảo tại **điểm giữa** hai trung bình Walsh
 * liền nhau cho khoảng mở, và **bao đóng của nó khớp chính xác** công thức cắt
 * đuôi. Nên hai đường thật ra là một; công thức cắt đuôi vừa đúng vừa rẻ hơn.
 *
 * | n | nghịch đảo tại điểm giữa | cắt đuôi |
 * |---|---|---|
 * | 12 | (3,25 ; 6,25) | **[3 ; 6,5]** |
 * | 5 | (−3,5 ; 4,5) | **[−4 ; 5]** |
 * | Likert 39 | (1,25 ; 1,25) | **[1 ; 1,5]** |
 *
 * ⚠️ Phân bố chính xác dựng trên hạng không trùng nhau, nên với thang Likert
 * nhiều giá trị trùng thì khoảng này là xấp xỉ. `note` sẽ nói rõ khi gặp.
 *
 * @param {{a: number, b: number}[]} pairs
 * @param {{alpha?: number}} [options]
 */
export function wilcoxonEffect(pairs, options = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('Không có cặp nào để tính cỡ hiệu ứng.');
  }
  const alpha = options.alpha ?? 0.05;

  const differences = pairs.map((pair) => pair.a - pair.b).filter((d) => d !== 0);
  const dropped = pairs.length - differences.length;

  if (differences.length === 0) {
    return {
      pairs: pairs.length,
      n: 0,
      dropped,
      rankBiserial: 0,
      hodgesLehmann: 0,
      ci: null,
      uninformative: true,
      alpha,
      note: 'Mọi cặp đều không chênh lệch — không có hiệu ứng nào để đo.',
    };
  }

  const test = wilcoxonSignedRankTest(pairs, { alpha });
  const rankTotal = test.wPlus + test.wMinus;
  const rankBiserial = rankTotal === 0 ? 0 : (test.wPlus - test.wMinus) / rankTotal;

  const n = differences.length;
  const walsh = walshAverages(differences);
  const hodgesLehmann = median(walsh);

  // Cắt k trung bình Walsh ở mỗi đầu, k = số j thoả P(W⁺ ≤ j) ≤ α/2.
  const counts = signedRankCounts(n);
  const subsetTotal = 2 ** n;
  const m = walsh.length;
  let trim = 0;
  let cumulative = 0;
  while (trim <= m) {
    cumulative += counts[trim] ?? 0;
    if (cumulative / subsetTotal > alpha / 2) break;
    trim += 1;
  }

  // trim = 0 nghĩa là không cắt được gì: khoảng trải hết tập Walsh.
  const uninformative = trim === 0;
  const valid = trim < m - trim;
  const ci = valid ? [walsh[trim], walsh[m - 1 - trim]] : null;

  const notes = [];
  if (!valid) {
    notes.push(
      `Cắt đuôi ${trim} giá trị mỗi đầu nhưng tập trung bình Walsh chỉ có ${m} giá trị — ` +
        'khoảng tin cậy rỗng. Gần như luôn là dấu hiệu dữ liệu vào có vấn đề.',
    );
  } else if (uninformative) {
    notes.push(
      `Với n = ${n}, không cắt được đuôi nào ở α = ${alpha}: khoảng tin cậy ` +
        'trải hết tập trung bình Walsh, tức nó **không cho biết gì**. Cỡ mẫu quá nhỏ để ước ' +
        'lượng khoảng — báo cáo phải nói rõ điều đó thay vì in ra một khoảng rộng như thể nó ' +
        'là kết quả.',
    );
  }
  if (test.tiedGroups.length > 0) {
    notes.push(
      `Có ${test.tiedGroups.length} nhóm chênh lệch trùng nhau. Phân bố chính xác dựng trên ` +
        'hạng không trùng, nên khoảng này là xấp xỉ — với thang Likert 5 mức thì trùng nhau ' +
        'là chuyện thường, không phải ngoại lệ.',
    );
  }

  return {
    pairs: pairs.length,
    n,
    dropped,
    rankBiserial,
    hodgesLehmann,
    ci,
    uninformative,
    alpha,
    ...(notes.length > 0 ? { note: notes.join(' ') } : {}),
  };
}
