#!/usr/bin/env Rscript
# Đối chiếu độc lập với `npm run analyse` (spec S4.2) — cùng tệp log, cùng số.
#
#   Rscript nghien-cuu/doi-chieu.R nghien-cuu/mau-log-gia-lap.json
#
# Cần R ≥ 4 và gói jsonlite (install.packages("jsonlite")). In đúng 6 giá trị p
# theo cùng thứ tự với `npm run analyse`, làm tròn 4 chữ số. Bốn luật phải mirror
# đúng để ra cùng số — tất cả đều ghi ở `src/research/statistics.js`:
#   1. cặp = LƯỢT ĐẦU của mỗi điều kiện trên mỗi người (một điều kiện xuất hiện 2 lần)
#   2. McNemar: nhị thức chính xác khi b + c < 25, không thì χ² có hiệu chỉnh liên tục
#   3. Wilcoxon: chính xác khi n < 25 và không có |d| trùng, không thì xấp xỉ chuẩn
#      có hiệu chỉnh liên tục 0,5 và hiệu chỉnh phương sai cho nhóm trùng (bỏ d = 0)
#   4. H2 chạy trên hai chiều ISO/TS 12913-3 suy từ 8 thuộc tính thô (tâm 3 → 0)

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 1) stop("Cách dùng: Rscript nghien-cuu/doi-chieu.R <log.json>")
t <- jsonlite::fromJSON(args[1])$trials

c45 <- cos(pi / 4); norm <- 4 + sqrt(32); k <- function(x) t[[x]] - 3
t$pleasantness <- (k("pleasant") - k("annoying") + c45 * (k("calm") - k("chaotic")) + c45 * (k("vibrant") - k("monotonous"))) / norm
t$eventfulness <- (k("eventful") - k("uneventful") + c45 * (k("chaotic") - k("calm")) + c45 * (k("vibrant") - k("monotonous"))) / norm

first <- function(cond) { s <- t[t$condition == cond, ]; s <- s[order(s$participant_index, s$order), ]; s[!duplicated(s$participant_index), ] }
pairs <- function(a, b, f) merge(first(a)[, c("participant_index", f)], first(b)[, c("participant_index", f)], by = "participant_index")

mcnemar <- function(x, y) {
  b <- sum(x & !y); c <- sum(!x & y)
  if (b + c == 0) return(1)
  if (b + c < 25) return(binom.test(min(b, c), b + c, 0.5)$p.value)
  mcnemar.test(matrix(c(sum(x & y), b, c, sum(!x & !y)), 2), correct = TRUE)$p.value
}
wilcoxon <- function(x, y) {
  d <- x - y; d <- d[d != 0]; n <- length(d)
  if (n == 0) return(1)
  suppressWarnings(wilcox.test(d, exact = n < 25 && !any(duplicated(abs(d))), correct = TRUE)$p.value)
}

for (b in c("isolated", "scrambled")) {
  m <- pairs("layered", b, "correct")
  cat(sprintf("layered vs %-9s McNemar               p = %.4f  (b + c = %d, n cặp = %d)\n",
              b, mcnemar(m$correct.x, m$correct.y), sum(m$correct.x != m$correct.y), nrow(m)))
  for (f in c("pleasantness", "eventfulness")) {
    m <- pairs("layered", b, f)
    cat(sprintf("layered vs %-9s Wilcoxon %-12s p = %.4f\n", b, f, wilcoxon(m[[paste0(f, ".x")]], m[[paste0(f, ".y")]])))
  }
}
