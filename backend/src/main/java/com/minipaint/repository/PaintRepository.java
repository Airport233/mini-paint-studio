package com.minipaint.repository;

import com.minipaint.model.entity.Paint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaintRepository extends JpaRepository<Paint, UUID> {
    List<Paint> findByUserId(UUID userId);
    long countByUserId(UUID userId);
}
