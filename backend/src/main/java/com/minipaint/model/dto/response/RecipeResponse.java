package com.minipaint.model.dto.response;

import com.minipaint.model.entity.Recipe;
import java.time.Instant;
import java.util.UUID;

public class RecipeResponse {
    private UUID id;
    private String name, tags, notes;
    private int targetR, targetG, targetB;
    private String mixSnapshots, cmyRef;
    private Instant createdAt;

    public static RecipeResponse from(Recipe r) {
        var resp = new RecipeResponse();
        resp.id = r.getId(); resp.name = r.getName(); resp.tags = r.getTags(); resp.notes = r.getNotes();
        resp.targetR = r.getTargetR(); resp.targetG = r.getTargetG(); resp.targetB = r.getTargetB();
        resp.mixSnapshots = r.getMixSnapshots(); resp.cmyRef = r.getCmyRef();
        resp.createdAt = r.getCreatedAt();
        return resp;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getTags() { return tags; }
    public String getNotes() { return notes; }
    public int getTargetR() { return targetR; }
    public int getTargetG() { return targetG; }
    public int getTargetB() { return targetB; }
    public String getMixSnapshots() { return mixSnapshots; }
    public String getCmyRef() { return cmyRef; }
    public Instant getCreatedAt() { return createdAt; }
}
