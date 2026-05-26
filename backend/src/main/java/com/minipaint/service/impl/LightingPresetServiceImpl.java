package com.minipaint.service.impl;

import com.minipaint.model.dto.request.LightingPresetSaveRequest;
import com.minipaint.model.dto.response.LightingPresetResponse;
import com.minipaint.model.entity.LightingPreset;
import com.minipaint.repository.LightingPresetRepository;
import com.minipaint.service.FileStorageService;
import com.minipaint.service.LightingPresetService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LightingPresetServiceImpl implements LightingPresetService {

    private final LightingPresetRepository repository;
    private final FileStorageService fileStorageService;

    public LightingPresetServiceImpl(LightingPresetRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public LightingPresetResponse save(UUID userId, LightingPresetSaveRequest request) {
        LightingPreset preset = new LightingPreset();
        preset.setUserId(userId);
        preset.setName(request.getName());
        preset.setGeometryType(request.getGeometryType());
        if (request.getGeometryRefId() != null && !request.getGeometryRefId().isEmpty()) {
            preset.setGeometryRefId(UUID.fromString(request.getGeometryRefId()));
        }
        preset.setMaterialSnapshot(request.getMaterialSnapshot());
        preset.setLightsSnapshot(request.getLightsSnapshot());
        preset.setStlFileName(request.getStlFileName());
        preset.setModelPos(request.getModelPos());
        preset.setModelRot(request.getModelRot());

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            String path = saveCoverImage(request.getCoverImage(), request.getName());
            preset.setCoverImagePath(path);
        }

        return LightingPresetResponse.from(repository.save(preset));
    }

    @Override
    public List<LightingPresetResponse> list(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(LightingPresetResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    public LightingPresetResponse getById(UUID userId, UUID presetId) {
        LightingPreset preset = findOwnedPreset(userId, presetId);
        return LightingPresetResponse.from(preset);
    }

    @Override
    public LightingPresetResponse update(UUID userId, UUID presetId, LightingPresetSaveRequest request) {
        LightingPreset preset = findOwnedPreset(userId, presetId);

        if (request.getName() != null) {
            preset.setName(request.getName());
        }
        if (request.getGeometryType() != null) {
            preset.setGeometryType(request.getGeometryType());
        }
        if (request.getGeometryRefId() != null) {
            preset.setGeometryRefId(request.getGeometryRefId().isEmpty() ? null : UUID.fromString(request.getGeometryRefId()));
        }
        if (request.getMaterialSnapshot() != null) {
            preset.setMaterialSnapshot(request.getMaterialSnapshot());
        }
        if (request.getLightsSnapshot() != null) {
            preset.setLightsSnapshot(request.getLightsSnapshot());
        }
        if (request.getModelPos() != null) {
            preset.setModelPos(request.getModelPos());
        }
        if (request.getModelRot() != null) {
            preset.setModelRot(request.getModelRot());
        }
        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            String path = saveCoverImage(request.getCoverImage(), request.getName() != null ? request.getName() : preset.getName());
            if (preset.getCoverImagePath() != null) {
                fileStorageService.delete(preset.getCoverImagePath());
            }
            preset.setCoverImagePath(path);
        }

        return LightingPresetResponse.from(repository.save(preset));
    }

    @Override
    public void delete(UUID userId, UUID presetId) {
        LightingPreset preset = findOwnedPreset(userId, presetId);
        if (preset.getCoverImagePath() != null) {
            fileStorageService.delete(preset.getCoverImagePath());
        }
        repository.delete(preset);
    }

    private LightingPreset findOwnedPreset(UUID userId, UUID presetId) {
        LightingPreset preset = repository.findById(presetId)
                .orElseThrow(() -> new RuntimeException("预设不存在"));
        if (!preset.getUserId().equals(userId)) {
            throw new RuntimeException("无权访问");
        }
        return preset;
    }

    private String saveCoverImage(String base64Data, String presetName) {
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);
        String safeName = presetName != null
                ? presetName.replaceAll("[^a-zA-Z0-9\\-]", "_").toLowerCase()
                : "untitled";
        return fileStorageService.store(inputStream, safeName + ".png", "lighting-covers");
    }
}
