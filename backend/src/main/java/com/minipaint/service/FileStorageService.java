package com.minipaint.service;

import java.io.InputStream;

public interface FileStorageService {
    String store(InputStream inputStream, String originalName, String subdir);
    void delete(String path);
    String toAccessUrl(String path);
}
