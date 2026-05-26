package com.minipaint.model.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lighting_presets")
public class LightingPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "geometry_type")
    private String geometryType;

    @Column(name = "geometry_ref_id")
    private UUID geometryRefId;

    @Column(name = "material_snapshot", columnDefinition = "TEXT")
    private String materialSnapshot;

    @Column(name = "lights_snapshot", columnDefinition = "TEXT")
    private String lightsSnapshot;

    @Column(name = "cover_image_path")
    private String coverImagePath;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public LightingPreset() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGeometryType() { return geometryType; }
    public void setGeometryType(String geometryType) { this.geometryType = geometryType; }

    public UUID getGeometryRefId() { return geometryRefId; }
    public void setGeometryRefId(UUID geometryRefId) { this.geometryRefId = geometryRefId; }

    public String getMaterialSnapshot() { return materialSnapshot; }
    public void setMaterialSnapshot(String materialSnapshot) { this.materialSnapshot = materialSnapshot; }

    public String getLightsSnapshot() { return lightsSnapshot; }
    public void setLightsSnapshot(String lightsSnapshot) { this.lightsSnapshot = lightsSnapshot; }

    public String getCoverImagePath() { return coverImagePath; }
    public void setCoverImagePath(String coverImagePath) { this.coverImagePath = coverImagePath; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
