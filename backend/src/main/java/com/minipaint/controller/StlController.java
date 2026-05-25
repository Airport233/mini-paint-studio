package com.minipaint.controller;

import com.minipaint.model.dto.request.StlRenameRequest;
import com.minipaint.model.dto.response.StlResponse;
import com.minipaint.model.entity.User;
import com.minipaint.service.StlService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/stl")
public class StlController {
    private final StlService stlService;

    public StlController(StlService stlService) { this.stlService = stlService; }

    @PostMapping("/upload")
    public ResponseEntity<StlResponse> upload(@AuthenticationPrincipal User user, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(stlService.upload(user.getId(), file));
    }

    @GetMapping
    public ResponseEntity<List<StlResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(stlService.list(user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StlResponse> update(@AuthenticationPrincipal User user, @PathVariable String id, @RequestBody StlRenameRequest req) {
        return ResponseEntity.ok(stlService.update(user.getId(), UUID.fromString(id),
            req.getDisplayName(), req.getRotationX(), req.getRotationY(), req.getRotationZ(), req.getHeightOffset()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user, @PathVariable String id) {
        stlService.delete(user.getId(), UUID.fromString(id));
        return ResponseEntity.ok(Map.of("message", "已删除"));
    }
}
