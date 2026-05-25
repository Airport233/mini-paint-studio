package com.minipaint.controller;

import com.minipaint.model.dto.request.PaintCreateRequest;
import com.minipaint.model.dto.request.PaintUpdateRequest;
import com.minipaint.model.dto.response.ErrorResponse;
import com.minipaint.model.dto.response.PaintResponse;
import com.minipaint.model.entity.User;
import com.minipaint.service.PaintService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/paints")
public class PaintController {

    private final PaintService paintService;

    public PaintController(PaintService paintService) {
        this.paintService = paintService;
    }

    @GetMapping
    public ResponseEntity<List<PaintResponse>> list(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page) {
        return ResponseEntity.ok(paintService.list(user.getId(), brand, sort, page));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaintCreateRequest request) {
        try {
            return ResponseEntity.ok(paintService.create(user.getId(), request));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, "该品牌下已存在相同色号的漆料"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(409, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody PaintUpdateRequest request) {
        try {
            return ResponseEntity.ok(paintService.update(user.getId(), java.util.UUID.fromString(id), request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            PaintResponse resp = paintService.delete(user.getId(), java.util.UUID.fromString(id));
            if (resp.getDeleteWarning() != null) {
                return ResponseEntity.ok(resp);
            }
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(400, e.getMessage()));
        }
    }
}
