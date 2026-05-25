package com.minipaint.model.dto.request;

public class StlRenameRequest {
    private String displayName;
    private Double rotationX, rotationY, rotationZ;
    private Double heightOffset;

    public String getDisplayName() { return displayName; }
    public Double getRotationX() { return rotationX; }
    public Double getRotationY() { return rotationY; }
    public Double getRotationZ() { return rotationZ; }
    public Double getHeightOffset() { return heightOffset; }
}
