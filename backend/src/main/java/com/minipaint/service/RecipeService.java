package com.minipaint.service;

import com.minipaint.model.dto.request.RecipeSaveRequest;
import com.minipaint.model.dto.request.RecipeUpdateRequest;
import com.minipaint.model.dto.response.RecipeResponse;
import java.util.List;
import java.util.UUID;

public interface RecipeService {
    RecipeResponse save(UUID userId, RecipeSaveRequest req);
    List<RecipeResponse> list(UUID userId, String tag, String search);
    RecipeResponse getById(UUID userId, UUID id);
    RecipeResponse update(UUID userId, UUID id, RecipeUpdateRequest req);
    void delete(UUID userId, UUID id);
}
