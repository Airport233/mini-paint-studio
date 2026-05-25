package com.minipaint.model.dto.response;

import java.util.UUID;

public class PaintPart {
    private UUID paintId;
    private String brand;
    private String code;
    private String name;
    private int parts;
    private boolean trace;

    public PaintPart() {}
    public PaintPart(UUID paintId, String brand, String code, String name, int parts, boolean trace) {
        this.paintId = paintId; this.brand = brand; this.code = code;
        this.name = name; this.parts = parts; this.trace = trace;
    }

    public UUID getPaintId() { return paintId; }
    public String getBrand() { return brand; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getParts() { return parts; }
    public boolean isTrace() { return trace; }
}
