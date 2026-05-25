package com.minipaint.model.dto.response;

import java.util.List;

public class MixCandidate {
    private List<PaintPart> paints;
    private int mixedR, mixedG, mixedB;
    private double deviation;

    public MixCandidate() {}
    public MixCandidate(List<PaintPart> paints, int mixedR, int mixedG, int mixedB, double deviation) {
        this.paints = paints; this.mixedR = mixedR; this.mixedG = mixedG;
        this.mixedB = mixedB; this.deviation = deviation;
    }

    public List<PaintPart> getPaints() { return paints; }
    public int getMixedR() { return mixedR; }
    public int getMixedG() { return mixedG; }
    public int getMixedB() { return mixedB; }
    public double getDeviation() { return deviation; }
}
