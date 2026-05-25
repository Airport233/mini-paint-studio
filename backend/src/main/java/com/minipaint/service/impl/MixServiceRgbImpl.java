package com.minipaint.service.impl;

import com.minipaint.model.dto.response.MixCandidate;
import com.minipaint.model.dto.response.MixResponse;
import com.minipaint.model.dto.response.PaintPart;
import com.minipaint.model.entity.Paint;
import com.minipaint.repository.PaintRepository;
import com.minipaint.service.MixService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MixServiceRgbImpl implements MixService {

    private static final int[] BLACK = {0, 0, 0};
    private static final int[] WHITE = {255, 255, 255};
    private static final int MAX_TOTAL_PARTS = 6;
    private static final double TRACE_THRESHOLD = 0.1;
    private static final double DEVIATION_WARNING = 15.0;
    private static final int TOP_N = 10;

    private final PaintRepository paintRepository;

    public MixServiceRgbImpl(PaintRepository paintRepository) {
        this.paintRepository = paintRepository;
    }

    @Override
    public MixResponse mix(UUID userId, int tr, int tg, int tb) {
        List<Paint> userPaints = paintRepository.findByUserId(userId);
        List<int[]> colors = new ArrayList<>();
        List<Paint> paints = new ArrayList<>();

        // Built-in black and white
        colors.add(BLACK); paints.add(null);
        colors.add(WHITE); paints.add(null);

        for (Paint p : userPaints) {
            colors.add(new int[]{p.getR(), p.getG(), p.getB()});
            paints.add(p);
        }

        List<MixCandidate> candidates = enumerate(colors, paints, tr, tg, tb);
        candidates.sort(Comparator.comparingDouble(MixCandidate::getDeviation));
        List<MixCandidate> topN = candidates.stream().limit(TOP_N).toList();

        List<PaintPart> cmyRef = generateCmyRef(tr, tg, tb);

        String message = null;
        if (userPaints.isEmpty()) {
            message = "录入更多漆料可获得更准确的结果";
        } else if (!topN.isEmpty() && topN.get(0).getDeviation() > DEVIATION_WARNING) {
            message = "偏差较大，仅供参考";
        }

        return new MixResponse(topN, cmyRef, message);
    }

    private List<MixCandidate> enumerate(List<int[]> colors, List<Paint> paints, int tr, int tg, int tb) {
        List<MixCandidate> results = new ArrayList<>();
        int n = colors.size();

        // 1-paint mixes — only 1 part each (parts count doesn't change the color)
        for (int i = 0; i < n; i++) {
            results.add(makeCandidate(colors, paints, List.of(i), List.of(1), tr, tg, tb));
        }

        // 2-paint mixes
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int p1 = 1; p1 < MAX_TOTAL_PARTS; p1++) {
                    for (int p2 = 1; p1 + p2 <= MAX_TOTAL_PARTS; p2++) {
                        results.add(makeCandidate(colors, paints, List.of(i, j), List.of(p1, p2), tr, tg, tb));
                    }
                }
            }
        }

        // 3-paint mixes
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    for (int p1 = 1; p1 <= MAX_TOTAL_PARTS - 2; p1++) {
                        for (int p2 = 1; p1 + p2 < MAX_TOTAL_PARTS; p2++) {
                            for (int p3 = 1; p1 + p2 + p3 <= MAX_TOTAL_PARTS; p3++) {
                                results.add(makeCandidate(colors, paints, List.of(i, j, k), List.of(p1, p2, p3), tr, tg, tb));
                            }
                        }
                    }
                }
            }
        }

        return results;
    }

    private MixCandidate makeCandidate(List<int[]> colors, List<Paint> paints,
            List<Integer> indices, List<Integer> partsList, int tr, int tg, int tb) {
        int total = partsList.stream().mapToInt(Integer::intValue).sum();
        int mr = 0, mg = 0, mb = 0;
        List<PaintPart> parts = new ArrayList<>();

        for (int idx = 0; idx < indices.size(); idx++) {
            int colorIdx = indices.get(idx);
            int[] c = colors.get(colorIdx);
            int part = partsList.get(idx);
            mr += c[0] * part;
            mg += c[1] * part;
            mb += c[2] * part;

            Paint p = paints.get(colorIdx);
            parts.add(new PaintPart(
                p != null ? p.getId() : null,
                p != null ? p.getBrand().name() : "SYSTEM",
                p != null ? p.getCode() : (colorIdx == 0 ? "BLACK" : "WHITE"),
                p != null ? p.getName() : (colorIdx == 0 ? "纯黑" : "纯白"),
                part,
                (double) part / total <= TRACE_THRESHOLD
            ));
        }

        mr /= total; mg /= total; mb /= total;
        double deviation = Math.sqrt(Math.pow(mr - tr, 2) + Math.pow(mg - tg, 2) + Math.pow(mb - tb, 2));
        return new MixCandidate(parts, mr, mg, mb, deviation);
    }

    private List<PaintPart> generateCmyRef(int r, int g, int b) {
        int c = 255 - r, m = 255 - g, y = 255 - b;
        int total = c + m + y;
        if (total == 0) return List.of();
        List<PaintPart> refs = new ArrayList<>();
        refs.add(new PaintPart(null, "SYSTEM", "CYAN", "青色", c, (double)c / total <= TRACE_THRESHOLD));
        refs.add(new PaintPart(null, "SYSTEM", "MAGENTA", "品红", m, (double)m / total <= TRACE_THRESHOLD));
        refs.add(new PaintPart(null, "SYSTEM", "YELLOW", "黄色", y, (double)y / total <= TRACE_THRESHOLD));
        // Add black for darkening, white for lightening
        int brightness = (r + g + b) / 3;
        if (brightness < 128) refs.add(new PaintPart(null, "SYSTEM", "WHITE", "纯白", 1, true));
        if (brightness > 128) refs.add(new PaintPart(null, "SYSTEM", "BLACK", "纯黑", 1, true));
        return refs;
    }
}
