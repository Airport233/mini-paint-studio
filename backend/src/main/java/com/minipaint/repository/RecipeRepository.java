package com.minipaint.repository;

import com.minipaint.model.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    List<Recipe> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
