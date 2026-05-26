package com.minipaint.model.dto.response;

import com.minipaint.model.entity.LightingPreset;
import java.time.Instant;
import java.util.UUID;

public class LightingPresetResponse {
    private UUID id;
    private String name;
    private String geometryType;
    private UUID geometryRefId;
    private String materialSnapshot;
    private String lightsSnapshot;
    private String coverImagePath;
    private Instant createdAt;

    public static LightingPresetResponse from(LightingPreset p) {
        LightingPresetResponse resp = new LightingPresetResponse();
        resp.id = p.getId();
        resp.name = p.getName();
        resp.geometryType = p.getGeometryType();
        resp.geometryRefId = p.getGeometryRefId();
        resp.materialSnapshot = p.getMaterialSnapshot();
        resp.lightsSnapshot = p.getLightsSnapshot();
        resp.coverImagePath = p.getCoverImagePath();
        resp.createdAt = p.getCreatedAt();
        return resp;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getGeometryType() { return geometryType; }
    public UUID getGeometryRefId() { return geometryRefId; }
    public String getMaterialSnapshot() { return materialSnapshot; }
    public String getLightsSnapshot() { return lightsSnapshot; }
    public String getCoverImagePath() { return coverImagePath; }
    public Instant getCreatedAt() { return createdAt; }
}
