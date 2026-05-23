package com.minipaint.model.dto.request;

import com.minipaint.enums.Brand;

public class PaintUpdateRequest {
    private Brand brand;
    private String code;
    private String name;

    public Brand getBrand() { return brand; } public void setBrand(Brand brand) { this.brand = brand; }
    public String getCode() { return code; } public void setCode(String code) { this.code = code; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
}
