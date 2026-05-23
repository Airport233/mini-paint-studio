package com.minipaint.model.dto.response;

import com.minipaint.enums.Brand;
import com.minipaint.model.entity.Paint;
import java.time.Instant;
import java.util.UUID;

public class PaintResponse {
    private UUID id;
    private Brand brand;
    private String code;
    private String name;
    private int r, g, b;
    private Instant createdAt;
    private String deleteWarning;

    public static PaintResponse from(Paint p) {
        PaintResponse r = new PaintResponse();
        r.id = p.getId(); r.brand = p.getBrand(); r.code = p.getCode(); r.name = p.getName();
        r.r = p.getR(); r.g = p.getG(); r.b = p.getB(); r.createdAt = p.getCreatedAt();
        return r;
    }

    public UUID getId() { return id; }
    public Brand getBrand() { return brand; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public int getR() { return r; }
    public int getG() { return g; }
    public int getB() { return b; }
    public Instant getCreatedAt() { return createdAt; }
    public String getDeleteWarning() { return deleteWarning; }
    public void setDeleteWarning(String deleteWarning) { this.deleteWarning = deleteWarning; }
}
