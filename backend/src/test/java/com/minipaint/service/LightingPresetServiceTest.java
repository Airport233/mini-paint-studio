package com.minipaint.service;

import com.minipaint.model.dto.request.LightingPresetSaveRequest;
import com.minipaint.model.dto.response.LightingPresetResponse;
import com.minipaint.model.entity.LightingPreset;
import com.minipaint.repository.LightingPresetRepository;
import com.minipaint.service.impl.LightingPresetServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LightingPresetServiceTest {

    @Mock
    private LightingPresetRepository repository;

    @Mock
    private FileStorageService fileStorageService;

    private LightingPresetService service;
    private final UUID userId = UUID.randomUUID();
    private final UUID presetId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new LightingPresetServiceImpl(repository, fileStorageService);
    }

    @Test
    void shouldSavePresetWithoutCoverImage() {
        LightingPresetSaveRequest req = new LightingPresetSaveRequest();
        req.setName("Test Preset");
        req.setGeometryType("sphere");
        req.setMaterialSnapshot("{\"r\":200,\"g\":100,\"b\":50,\"roughness\":0.5,\"metalness\":0.3}");
        req.setLightsSnapshot("[{\"type\":\"directional\",\"pos\":{\"x\":1,\"y\":2,\"z\":3},\"hex\":\"#ffffff\",\"colorTemp\":6500,\"intensity\":1.0,\"enabled\":true}]");

        LightingPreset saved = new LightingPreset();
        saved.setId(presetId);
        saved.setUserId(userId);
        saved.setName("Test Preset");
        saved.setGeometryType("sphere");
        saved.setMaterialSnapshot("{\"r\":200,\"g\":100,\"b\":50,\"roughness\":0.5,\"metalness\":0.3}");
        saved.setLightsSnapshot("[{\"type\":\"directional\",\"pos\":{\"x\":1,\"y\":2,\"z\":3},\"hex\":\"#ffffff\",\"colorTemp\":6500,\"intensity\":1.0,\"enabled\":true}]");
        saved.setCreatedAt(Instant.now());

        when(repository.save(any(LightingPreset.class))).thenReturn(saved);

        LightingPresetResponse resp = service.save(userId, req);

        assertThat(resp).isNotNull();
        assertThat(resp.getId()).isEqualTo(presetId);
        assertThat(resp.getName()).isEqualTo("Test Preset");
        assertThat(resp.getGeometryType()).isEqualTo("sphere");
        assertThat(resp.getMaterialSnapshot()).contains("\"r\":200");

        ArgumentCaptor<LightingPreset> captor = ArgumentCaptor.forClass(LightingPreset.class);
        verify(repository).save(captor.capture());
        LightingPreset captured = captor.getValue();
        assertThat(captured.getUserId()).isEqualTo(userId);
        assertThat(captured.getCoverImagePath()).isNull();
    }

    @Test
    void shouldSavePresetWithBase64CoverImage() {
        LightingPresetSaveRequest req = new LightingPresetSaveRequest();
        req.setName("Cover Preset");
        req.setGeometryType("cube");
        req.setCoverImage("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        LightingPreset saved = new LightingPreset();
        saved.setId(presetId);
        saved.setUserId(userId);
        saved.setName("Cover Preset");
        saved.setGeometryType("cube");
        saved.setCoverImagePath("lighting-covers/cover-preset.png");
        saved.setCreatedAt(Instant.now());

        when(fileStorageService.store(any(InputStream.class), anyString(), anyString())).thenReturn("lighting-covers/cover-preset.png");
        when(repository.save(any(LightingPreset.class))).thenReturn(saved);

        LightingPresetResponse resp = service.save(userId, req);

        assertThat(resp).isNotNull();
        assertThat(resp.getCoverImagePath()).isEqualTo("lighting-covers/cover-preset.png");
        verify(fileStorageService).store(any(InputStream.class), eq("cover_preset.png"), eq("lighting-covers"));
    }

    @Test
    void shouldListPresetsOrderedByCreatedAtDesc() {
        LightingPreset p1 = new LightingPreset();
        p1.setId(UUID.randomUUID());
        p1.setUserId(userId);
        p1.setName("Preset 1");
        p1.setCreatedAt(Instant.now().minusSeconds(10));

        LightingPreset p2 = new LightingPreset();
        p2.setId(UUID.randomUUID());
        p2.setUserId(userId);
        p2.setName("Preset 2");
        p2.setCreatedAt(Instant.now());

        when(repository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(p2, p1));

        List<LightingPresetResponse> results = service.list(userId);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getName()).isEqualTo("Preset 2");
        assertThat(results.get(1).getName()).isEqualTo("Preset 1");
    }

    @Test
    void shouldGetPresetByIdAndVerifyOwnership() {
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(userId);
        preset.setName("My Preset");
        preset.setCreatedAt(Instant.now());

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));

        LightingPresetResponse resp = service.getById(userId, presetId);

        assertThat(resp).isNotNull();
        assertThat(resp.getName()).isEqualTo("My Preset");
    }

    @Test
    void shouldThrowWhenGettingNonOwnedPreset() {
        UUID otherUserId = UUID.randomUUID();
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(otherUserId);
        preset.setName("Their Preset");

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));

        assertThatThrownBy(() -> service.getById(userId, presetId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("无权");
    }

    @Test
    void shouldUpdatePreset() {
        LightingPresetSaveRequest req = new LightingPresetSaveRequest();
        req.setName("Updated Preset");
        req.setMaterialSnapshot("{\"r\":100,\"g\":200,\"b\":50}");

        LightingPreset existing = new LightingPreset();
        existing.setId(presetId);
        existing.setUserId(userId);
        existing.setName("Old Name");
        existing.setMaterialSnapshot("{}");

        LightingPreset updated = new LightingPreset();
        updated.setId(presetId);
        updated.setUserId(userId);
        updated.setName("Updated Preset");
        updated.setMaterialSnapshot("{\"r\":100,\"g\":200,\"b\":50}");
        updated.setCreatedAt(Instant.now());

        when(repository.findById(presetId)).thenReturn(Optional.of(existing));
        when(repository.save(any(LightingPreset.class))).thenReturn(updated);

        LightingPresetResponse resp = service.update(userId, presetId, req);

        assertThat(resp.getName()).isEqualTo("Updated Preset");
        assertThat(resp.getMaterialSnapshot()).contains("\"r\":100");
    }

    @Test
    void shouldDeletePreset() {
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(userId);
        preset.setName("To Delete");

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));
        doNothing().when(repository).delete(preset);

        service.delete(userId, presetId);

        verify(repository).delete(preset);
    }

    @Test
    void shouldDeleteCoverImageWhenDeletingPreset() {
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(userId);
        preset.setName("With Cover");
        preset.setCoverImagePath("lighting-covers/some-cover.png");

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));
        doNothing().when(repository).delete(preset);
        doNothing().when(fileStorageService).delete("lighting-covers/some-cover.png");

        service.delete(userId, presetId);

        verify(fileStorageService).delete("lighting-covers/some-cover.png");
        verify(repository).delete(preset);
    }

    @Test
    void shouldNotDeleteCoverImageWhenNull() {
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(userId);
        preset.setName("No Cover");

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));
        doNothing().when(repository).delete(preset);

        service.delete(userId, presetId);

        verify(fileStorageService, never()).delete(anyString());
        verify(repository).delete(preset);
    }

    @Test
    void shouldThrowWhenUpdatingNonOwnedPreset() {
        UUID otherUserId = UUID.randomUUID();
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(otherUserId);

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));

        assertThatThrownBy(() -> service.update(userId, presetId, new LightingPresetSaveRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("无权");
    }

    @Test
    void shouldThrowWhenDeletingNonOwnedPreset() {
        UUID otherUserId = UUID.randomUUID();
        LightingPreset preset = new LightingPreset();
        preset.setId(presetId);
        preset.setUserId(otherUserId);

        when(repository.findById(presetId)).thenReturn(Optional.of(preset));

        assertThatThrownBy(() -> service.delete(userId, presetId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("无权");
    }
}
