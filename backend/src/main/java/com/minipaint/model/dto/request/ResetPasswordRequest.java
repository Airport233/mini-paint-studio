package com.minipaint.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank
    private String token;
    @NotBlank
    @Size(min = 8, message = "密码长度至少需要 8 位")
    private String newPassword;

    public String getToken() { return token; }
    public String getNewPassword() { return newPassword; }
    public void setToken(String token) { this.token = token; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
