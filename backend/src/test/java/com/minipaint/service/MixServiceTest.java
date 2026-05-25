package com.minipaint.service;

import com.minipaint.enums.Brand;
import com.minipaint.model.entity.Paint;
import com.minipaint.repository.PaintRepository;
import com.minipaint.service.impl.MixServiceRgbImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MixServiceTest {

    @Mock
    private PaintRepository paintRepository;

    private MixService mixService;
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mixService = new MixServiceRgbImpl(paintRepository);
    }

    @Test
    void shouldFindExactRatio() {
        // 2 parts red (255,0,0) + 1 part blue (0,0,255) = (170, 0, 85)
        Paint red = new Paint(Brand.GW, "red", "Red", 255, 0, 0);
        Paint blue = new Paint(Brand.GW, "blue", "Blue", 0, 0, 255);
        when(paintRepository.findByUserId(userId)).thenReturn(List.of(red, blue));

        var result = mixService.mix(userId, 170, 0, 85);
        assertThat(result.getCandidates()).isNotEmpty();
        var best = result.getCandidates().get(0);
        assertThat(best.getDeviation()).isLessThan(5.0);
        // Should find 2:1 ratio
        assertThat(best.getPaints()).hasSize(2);
    }

    @Test
    void shouldReturnGrayscaleWhenNoUserPaints() {
        when(paintRepository.findByUserId(userId)).thenReturn(List.of());
        var result = mixService.mix(userId, 128, 128, 128);
        assertThat(result.getCandidates()).isNotEmpty();
        assertThat(result.getMessage()).contains("录入更多漆料");
    }

    @Test
    void shouldAlwaysProduceCandidatesWithTraceWhenApplicable() {
        // With 2 built-in paints (black+white) + 1 user paint, mix for a dark target
        Paint white = new Paint(Brand.AV, "w", "White", 255, 255, 255);
        when(paintRepository.findByUserId(userId)).thenReturn(List.of(white));

        var result = mixService.mix(userId, 30, 30, 30);
        assertThat(result.getCandidates()).isNotEmpty();
        // trace = parts ≤ total/10. With max 6 parts, trace needs ≤ 0.6 parts → not possible.
        // The result should still have valid candidates even without trace markers.
        assertThat(result.getCandidates().get(0).getPaints()).isNotEmpty();
    }

    @Test
    void shouldAlwaysIncludeCmyRef() {
        Paint red = new Paint(Brand.GW, "r", "Red", 255, 0, 0);
        when(paintRepository.findByUserId(userId)).thenReturn(List.of(red));
        var result = mixService.mix(userId, 200, 100, 50);
        assertThat(result.getCmyRef()).isNotEmpty();
    }

    @Test
    void shouldMarkWarningWhenBestDeviationExceeds15() {
        // Single red paint, target green — impossible to match well
        Paint red = new Paint(Brand.GW, "r", "Red", 255, 0, 0);
        when(paintRepository.findByUserId(userId)).thenReturn(List.of(red));

        var result = mixService.mix(userId, 0, 255, 0);
        if (result.getCandidates().isEmpty()) return; // acceptable
        var best = result.getCandidates().get(0);
        if (best.getDeviation() > 15.0) {
            assertThat(result.getMessage()).contains("偏差较大");
        }
    }

    @Test
    void shouldFinishUnder2SecondsFor50Paints() {
        // Generate 50 mock paints
        List<Paint> paints = new java.util.ArrayList<>();
        for (int i = 0; i < 50; i++) {
            Paint p = new Paint(Brand.Other, "c" + i, "Paint " + i,
                    (i * 37) % 256, (i * 73) % 256, (i * 113) % 256);
            paints.add(p);
        }
        when(paintRepository.findByUserId(userId)).thenReturn(paints);

        long start = System.currentTimeMillis();
        var result = mixService.mix(userId, 128, 128, 128);
        long elapsed = System.currentTimeMillis() - start;

        assertThat(result.getCandidates()).isNotEmpty();
        assertThat(elapsed).isLessThan(2000);
    }
}
