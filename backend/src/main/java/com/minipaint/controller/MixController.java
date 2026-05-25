package com.minipaint.controller;

import com.minipaint.model.dto.request.MixRequest;
import com.minipaint.model.dto.response.MixResponse;
import com.minipaint.model.entity.User;
import com.minipaint.service.MixService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MixController {

    private final MixService mixService;

    public MixController(MixService mixService) {
        this.mixService = mixService;
    }

    @PostMapping("/mix")
    public ResponseEntity<MixResponse> mix(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MixRequest request) {
        MixResponse response = mixService.mix(user.getId(), request.getR(), request.getG(), request.getB());
        return ResponseEntity.ok(response);
    }
}
