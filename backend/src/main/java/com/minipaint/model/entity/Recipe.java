package com.minipaint.model.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recipes")
public class Recipe {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id") private UUID userId;
    private String name;

    @Column(length = 2000)
    private String tags;

    private int targetR, targetG, targetB;

    @Column(columnDefinition = "TEXT")
    private String mixSnapshots;

    @Column(columnDefinition = "TEXT")
    private String cmyRef;

    private String notes;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }

    public Recipe() {}
    public Recipe(UUID userId, String name, String tags, int tr, int tg, int tb, String mixSnapshots, String cmyRef, String notes) {
        this.userId = userId; this.name = name; this.tags = tags;
        this.targetR = tr; this.targetG = tg; this.targetB = tb;
        this.mixSnapshots = mixSnapshots; this.cmyRef = cmyRef; this.notes = notes;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getName() { return name; }
    public void setName(String n) { name = n; }
    public String getTags() { return tags; }
    public void setTags(String t) { tags = t; }
    public int getTargetR() { return targetR; }
    public int getTargetG() { return targetG; }
    public int getTargetB() { return targetB; }
    public String getMixSnapshots() { return mixSnapshots; }
    public String getCmyRef() { return cmyRef; }
    public String getNotes() { return notes; }
    public void setNotes(String n) { notes = n; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
