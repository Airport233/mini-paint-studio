package com.minipaint.service;

import com.minipaint.model.dto.request.PaintCreateRequest;
import com.minipaint.model.dto.request.PaintUpdateRequest;
import com.minipaint.model.dto.response.PaintResponse;
import java.util.List;
import java.util.UUID;

public interface PaintService {
    List<PaintResponse> list(UUID userId, String brand, String sort, int page);
    PaintResponse create(UUID userId, PaintCreateRequest request);
    PaintResponse update(UUID userId, UUID paintId, PaintUpdateRequest request);
    PaintResponse delete(UUID userId, UUID paintId);
}
