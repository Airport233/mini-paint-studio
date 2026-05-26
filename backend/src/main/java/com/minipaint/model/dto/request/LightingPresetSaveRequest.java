package com.minipaint.model.dto.request;

public class LightingPresetSaveRequest {
    private String name;
    private String geometryType;
    private String geometryRefId;
    private String materialSnapshot;
    private String lightsSnapshot;
    private String coverImage;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGeometryType() { return geometryType; }
    public void setGeometryType(String geometryType) { this.geometryType = geometryType; }

    public String getGeometryRefId() { return geometryRefId; }
    public void setGeometryRefId(String geometryRefId) { this.geometryRefId = geometryRefId; }

    public String getMaterialSnapshot() { return materialSnapshot; }
    public void setMaterialSnapshot(String materialSnapshot) { this.materialSnapshot = materialSnapshot; }

    public String getLightsSnapshot() { return lightsSnapshot; }
    public void setLightsSnapshot(String lightsSnapshot) { this.lightsSnapshot = lightsSnapshot; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
}
