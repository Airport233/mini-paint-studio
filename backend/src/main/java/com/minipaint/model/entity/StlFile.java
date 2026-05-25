package com.minipaint.model.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stl_files")
public class StlFile {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id") private UUID userId;
    private String originalName;
    private String displayName;
    private String filePath;
    private double rotationX, rotationY, rotationZ;
    private double heightOffset;
    private long fileSize;
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist void onCreate() { if (createdAt == null) createdAt = Instant.now(); }

    public StlFile() {}
    public StlFile(UUID userId, String originalName, String displayName, String filePath, long fileSize) {
        this.userId = userId; this.originalName = originalName; this.displayName = displayName;
        this.filePath = filePath; this.fileSize = fileSize;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getOriginalName() { return originalName; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String d) { displayName = d; }
    public String getFilePath() { return filePath; }
    public double getRotationX() { return rotationX; }
    public void setRotationX(double v) { rotationX = v; }
    public double getRotationY() { return rotationY; }
    public void setRotationY(double v) { rotationY = v; }
    public double getRotationZ() { return rotationZ; }
    public void setRotationZ(double v) { rotationZ = v; }
    public double getHeightOffset() { return heightOffset; }
    public void setHeightOffset(double v) { heightOffset = v; }
    public long getFileSize() { return fileSize; }
    public Instant getCreatedAt() { return createdAt; }
}
