package com.minipaint.model.dto.request;

import com.minipaint.enums.Brand;
import jakarta.validation.constraints.*;

public class PaintCreateRequest {
    @NotNull private Brand brand;
    @NotBlank private String code;
    @NotBlank private String name;
    @Min(0) @Max(255) private int r;
    @Min(0) @Max(255) private int g;
    @Min(0) @Max(255) private int b;

    public Brand getBrand() { return brand; } public void setBrand(Brand brand) { this.brand = brand; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public int getR() { return r; } public void setR(int r) { this.r = r; }
    public int getG() { return g; } public void setG(int g) { this.g = g; }
    public int getB() { return b; } public void setB(int b) { this.b = b; }
}
