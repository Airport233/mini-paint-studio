package com.minipaint.service;

import com.minipaint.model.dto.request.LightingPresetSaveRequest;
import com.minipaint.model.dto.response.LightingPresetResponse;
import java.util.List;
import java.util.UUID;

public interface LightingPresetService {
    LightingPresetResponse save(UUID userId, LightingPresetSaveRequest request);
    List<LightingPresetResponse> list(UUID userId);
    LightingPresetResponse getById(UUID userId, UUID presetId);
    LightingPresetResponse update(UUID userId, UUID presetId, LightingPresetSaveRequest request);
    void delete(UUID userId, UUID presetId);
}
