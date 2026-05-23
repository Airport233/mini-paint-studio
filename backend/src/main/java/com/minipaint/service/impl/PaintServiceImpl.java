package com.minipaint.service.impl;

import com.minipaint.enums.Brand;
import com.minipaint.model.dto.request.PaintCreateRequest;
import com.minipaint.model.dto.request.PaintUpdateRequest;
import com.minipaint.model.dto.response.PaintResponse;
import com.minipaint.model.entity.Paint;
import com.minipaint.repository.PaintRepository;
import com.minipaint.service.PaintService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.Comparator;

@Service
public class PaintServiceImpl implements PaintService {

    private final PaintRepository paintRepository;

    public PaintServiceImpl(PaintRepository paintRepository) {
        this.paintRepository = paintRepository;
    }

    @Override
    public List<PaintResponse> list(UUID userId, String brand, String sort, int page) {
        List<Paint> all = paintRepository.findByUserId(userId);
        if (brand != null && !brand.isEmpty()) {
            all = all.stream().filter(p -> p.getBrand().name().equals(brand)).toList();
        }
        if ("hue".equals(sort)) {
            all = all.stream().sorted(Comparator.comparingInt(Paint::getHue)).toList();
        } else {
            all = all.stream().sorted(Comparator.comparing(Paint::getCreatedAt).reversed()).toList();
        }
        return all.stream().map(PaintResponse::from).toList();
    }

    @Override
    public PaintResponse create(UUID userId, PaintCreateRequest req) {
        Paint paint = new Paint(req.getBrand(), req.getCode(), req.getName(), req.getR(), req.getG(), req.getB());
        paint.setUserId(userId);
        paint = paintRepository.save(paint);
        return PaintResponse.from(paint);
    }

    @Override
    public PaintResponse update(UUID userId, UUID paintId, PaintUpdateRequest req) {
        Paint paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new RuntimeException("漆料不存在"));
        if (!paint.getUserId().equals(userId)) throw new RuntimeException("无权修改");
        if (req.getBrand() != null) paint.setBrand(req.getBrand());
        if (req.getCode() != null) paint.setCode(req.getCode());
        if (req.getName() != null) paint.setName(req.getName());
        paint = paintRepository.save(paint);
        return PaintResponse.from(paint);
    }

    @Override
    public PaintResponse delete(UUID userId, UUID paintId) {
        Paint paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new RuntimeException("漆料不存在"));
        if (!paint.getUserId().equals(userId)) throw new RuntimeException("无权删除");
        PaintResponse resp = PaintResponse.from(paint);
        // Check recipe references (simplified — full implementation in Phase 6)
        resp.setDeleteWarning(null);
        paintRepository.delete(paint);
        return resp;
    }
}
