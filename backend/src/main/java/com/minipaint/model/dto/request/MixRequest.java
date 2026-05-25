package com.minipaint.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class MixRequest {
    @Min(0) @Max(255) private int r;
    @Min(0) @Max(255) private int g;
    @Min(0) @Max(255) private int b;

    public int getR() { return r; } public void setR(int r) { this.r = r; }
    public int getG() { return g; } public void setG(int g) { this.g = g; }
    public int getB() { return b; } public void setB(int b) { this.b = b; }
}
