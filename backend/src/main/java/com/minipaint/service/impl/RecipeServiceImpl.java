package com.minipaint.service.impl;

import com.minipaint.model.dto.request.RecipeSaveRequest;
import com.minipaint.model.dto.request.RecipeUpdateRequest;
import com.minipaint.model.dto.response.RecipeResponse;
import com.minipaint.model.entity.Recipe;
import com.minipaint.repository.RecipeRepository;
import com.minipaint.service.RecipeService;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecipeServiceImpl implements RecipeService {
    private final RecipeRepository repo;

    public RecipeServiceImpl(RecipeRepository repo) { this.repo = repo; }

    @Override
    public RecipeResponse save(UUID userId, RecipeSaveRequest req) {
        var r = new Recipe(userId, req.getName(), req.getTags(), req.getTargetR(), req.getTargetG(), req.getTargetB(),
            req.getMixSnapshots(), req.getCmyRef(), req.getNotes());
        return RecipeResponse.from(repo.save(r));
    }

    @Override
    public List<RecipeResponse> list(UUID userId, String tag, String search) {
        var all = repo.findByUserIdOrderByCreatedAtDesc(userId);
        if (tag != null && !tag.isEmpty()) {
            all = all.stream().filter(r -> r.getTags() != null && Arrays.asList(r.getTags().split(",")).contains(tag)).collect(Collectors.toList());
        }
        if (search != null && !search.isEmpty()) {
            var q = search.toLowerCase();
            all = all.stream().filter(r -> r.getName().toLowerCase().contains(q)).collect(Collectors.toList());
        }
        return all.stream().map(RecipeResponse::from).collect(Collectors.toList());
    }

    @Override
    public RecipeResponse getById(UUID userId, UUID id) {
        var r = repo.findById(id).orElseThrow(() -> new RuntimeException("配方不存在"));
        if (!r.getUserId().equals(userId)) throw new RuntimeException("无权访问");
        return RecipeResponse.from(r);
    }

    @Override
    public RecipeResponse update(UUID userId, UUID id, RecipeUpdateRequest req) {
        var r = repo.findById(id).orElseThrow(() -> new RuntimeException("配方不存在"));
        if (!r.getUserId().equals(userId)) throw new RuntimeException("无权修改");
        if (req.getName() != null) r.setName(req.getName());
        if (req.getTags() != null) r.setTags(req.getTags());
        if (req.getNotes() != null) r.setNotes(req.getNotes());
        return RecipeResponse.from(repo.save(r));
    }

    @Override
    public void delete(UUID userId, UUID id) {
        var r = repo.findById(id).orElseThrow(() -> new RuntimeException("配方不存在"));
        if (!r.getUserId().equals(userId)) throw new RuntimeException("无权删除");
        repo.delete(r);
    }
}
