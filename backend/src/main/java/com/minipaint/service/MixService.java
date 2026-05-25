package com.minipaint.service;

import com.minipaint.model.dto.response.MixResponse;
import java.util.UUID;

public interface MixService {
    MixResponse mix(UUID userId, int r, int g, int b);
}
