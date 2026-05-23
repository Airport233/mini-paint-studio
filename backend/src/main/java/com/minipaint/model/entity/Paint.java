package com.minipaint.model.entity;

import com.minipaint.enums.Brand;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "paints", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "brand", "code"})
})
public class Paint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Brand brand;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    private int r;

    @Column(nullable = false)
    private int g;

    @Column(nullable = false)
    private int b;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Paint() {}

    public Paint(Brand brand, String code, String name, int r, int g, int b) {
        this.brand = brand;
        this.code = code;
        this.name = name;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getR() { return r; }
    public int getG() { return g; }
    public int getB() { return b; }
    public void setR(int r) { this.r = r; }
    public void setG(int g) { this.g = g; }
    public void setB(int b) { this.b = b; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public int getHue() {
        float[] hsb = java.awt.Color.RGBtoHSB(r, g, b, null);
        return Math.round(hsb[0] * 360);
    }
}
