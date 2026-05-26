package com.minipaint.controller;

import com.minipaint.model.dto.request.LightingPresetSaveRequest;
import com.minipaint.model.dto.response.LightingPresetResponse;
import com.minipaint.model.entity.User;
import com.minipaint.service.LightingPresetService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/lighting-presets")
public class LightingPresetController {

    private final LightingPresetService lightingPresetService;

    public LightingPresetController(LightingPresetService lightingPresetService) {
        this.lightingPresetService = lightingPresetService;
    }

    @PostMapping
    public ResponseEntity<LightingPresetResponse> save(@AuthenticationPrincipal User user,
                                                       @RequestBody LightingPresetSaveRequest req) {
        return ResponseEntity.ok(lightingPresetService.save(user.getId(), req));
    }

    @GetMapping
    public ResponseEntity<List<LightingPresetResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(lightingPresetService.list(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LightingPresetResponse> get(@AuthenticationPrincipal User user,
                                                      @PathVariable String id) {
        return ResponseEntity.ok(lightingPresetService.getById(user.getId(), UUID.fromString(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LightingPresetResponse> update(@AuthenticationPrincipal User user,
                                                         @PathVariable String id,
                                                         @RequestBody LightingPresetSaveRequest req) {
        return ResponseEntity.ok(lightingPresetService.update(user.getId(), UUID.fromString(id), req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user,
                                    @PathVariable String id) {
        lightingPresetService.delete(user.getId(), UUID.fromString(id));
        return ResponseEntity.ok(Map.of("message", "已删除"));
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<byte[]> getCover(@AuthenticationPrincipal User user, @PathVariable String id) {
        var preset = lightingPresetService.getById(user.getId(), UUID.fromString(id));
        if (preset.getCoverImagePath() == null) return ResponseEntity.notFound().build();
        try {
            byte[] bytes = Files.readAllBytes(Path.of(preset.getCoverImagePath()));
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(bytes);
        } catch (Exception e) { return ResponseEntity.notFound().build(); }
    }
}
