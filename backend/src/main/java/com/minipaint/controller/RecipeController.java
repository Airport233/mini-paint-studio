package com.minipaint.controller;

import com.minipaint.model.dto.request.RecipeSaveRequest;
import com.minipaint.model.dto.request.RecipeUpdateRequest;
import com.minipaint.model.dto.response.RecipeResponse;
import com.minipaint.model.entity.User;
import com.minipaint.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) { this.recipeService = recipeService; }

    @PostMapping
    public ResponseEntity<RecipeResponse> save(@AuthenticationPrincipal User user, @RequestBody RecipeSaveRequest req) {
        return ResponseEntity.ok(recipeService.save(user.getId(), req));
    }

    @GetMapping
    public ResponseEntity<List<RecipeResponse>> list(@AuthenticationPrincipal User user,
            @RequestParam(required = false) String tag, @RequestParam(required = false) String search) {
        return ResponseEntity.ok(recipeService.list(user.getId(), tag, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> get(@AuthenticationPrincipal User user, @PathVariable String id) {
        return ResponseEntity.ok(recipeService.getById(user.getId(), UUID.fromString(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponse> update(@AuthenticationPrincipal User user, @PathVariable String id, @RequestBody RecipeUpdateRequest req) {
        return ResponseEntity.ok(recipeService.update(user.getId(), UUID.fromString(id), req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user, @PathVariable String id) {
        recipeService.delete(user.getId(), UUID.fromString(id));
        return ResponseEntity.ok(Map.of("message", "已删除"));
    }
}
