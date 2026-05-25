package com.minipaint.model.dto.request;

public class RecipeSaveRequest {
    private String name, tags, notes;
    private int targetR, targetG, targetB;
    private String mixSnapshots, cmyRef;

    public String getName() { return name; } public void setName(String n) { name = n; }
    public String getTags() { return tags; } public void setTags(String t) { tags = t; }
    public String getNotes() { return notes; } public void setNotes(String n) { notes = n; }
    public int getTargetR() { return targetR; } public void setTargetR(int r) { targetR = r; }
    public int getTargetG() { return targetG; } public void setTargetG(int g) { targetG = g; }
    public int getTargetB() { return targetB; } public void setTargetB(int b) { targetB = b; }
    public String getMixSnapshots() { return mixSnapshots; } public void setMixSnapshots(String s) { mixSnapshots = s; }
    public String getCmyRef() { return cmyRef; } public void setCmyRef(String s) { cmyRef = s; }
}
