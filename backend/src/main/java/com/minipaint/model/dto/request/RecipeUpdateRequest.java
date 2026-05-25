package com.minipaint.model.dto.request;

public class RecipeUpdateRequest {
    private String name, tags, notes;
    public String getName() { return name; } public void setName(String n) { name = n; }
    public String getTags() { return tags; } public void setTags(String t) { tags = t; }
    public String getNotes() { return notes; } public void setNotes(String n) { notes = n; }
}
