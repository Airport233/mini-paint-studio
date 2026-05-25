package com.minipaint.model.dto.response;

import java.util.List;

public class MixResponse {
    private List<MixCandidate> candidates;
    private List<PaintPart> cmyRef;
    private String message;

    public MixResponse() {}
    public MixResponse(List<MixCandidate> candidates, List<PaintPart> cmyRef, String message) {
        this.candidates = candidates; this.cmyRef = cmyRef; this.message = message;
    }

    public List<MixCandidate> getCandidates() { return candidates; }
    public List<PaintPart> getCmyRef() { return cmyRef; }
    public String getMessage() { return message; }
}
