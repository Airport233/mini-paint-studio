package com.minipaint.repository;

import com.minipaint.model.entity.LightingPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LightingPresetRepository extends JpaRepository<LightingPreset, UUID> {
    List<LightingPreset> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<LightingPreset> findByUserIdAndGeometryRefId(UUID userId, UUID geometryRefId);
}
