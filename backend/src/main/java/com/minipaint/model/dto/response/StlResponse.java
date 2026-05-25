package com.minipaint.model.dto.response;

import com.minipaint.model.entity.StlFile;
import java.util.UUID;

public class StlResponse {
    private UUID id;
    private String displayName, originalName;
    private long fileSize;
    private double rotationX, rotationY, rotationZ;
    private double heightOffset;

    public static StlResponse from(StlFile f) {
        var r = new StlResponse();
        r.id = f.getId(); r.displayName = f.getDisplayName(); r.originalName = f.getOriginalName();
        r.fileSize = f.getFileSize();
        r.rotationX = f.getRotationX(); r.rotationY = f.getRotationY(); r.rotationZ = f.getRotationZ();
        r.heightOffset = f.getHeightOffset();
        return r;
    }

    public UUID getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getOriginalName() { return originalName; }
    public long getFileSize() { return fileSize; }
    public double getRotationX() { return rotationX; }
    public double getRotationY() { return rotationY; }
    public double getRotationZ() { return rotationZ; }
    public double getHeightOffset() { return heightOffset; }
}
