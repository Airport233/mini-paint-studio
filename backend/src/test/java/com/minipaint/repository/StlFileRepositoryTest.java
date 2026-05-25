package com.minipaint.repository;

import com.minipaint.model.entity.StlFile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.assertj.core.api.Assertions.*;
import java.util.UUID;

@DataJpaTest
class StlFileRepositoryTest {
    @Autowired private StlFileRepository repo;

    @Test
    void shouldSaveAndFind() {
        var f = new StlFile(UUID.randomUUID(), "model.stl", "My Model", "/stl/model.stl", 1024);
        var saved = repo.save(f);
        assertThat(saved.getId()).isNotNull();
        assertThat(repo.findById(saved.getId())).isPresent();
    }

    @Test
    void shouldFindByUserId() {
        UUID uid = UUID.randomUUID();
        repo.save(new StlFile(uid, "a.stl", "A", "/a.stl", 100));
        repo.save(new StlFile(uid, "b.stl", "B", "/b.stl", 200));
        assertThat(repo.findByUserId(uid)).hasSize(2);
    }
}
