package com.minipaint.repository;

import com.minipaint.model.entity.Recipe;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.assertj.core.api.Assertions.*;
import java.util.UUID;

@DataJpaTest
class RecipeRepositoryTest {
    @Autowired private RecipeRepository repo;

    @Test
    void shouldSaveAndFind() {
        var r = new Recipe(UUID.randomUUID(), "Test", "blue,highlight", 200, 100, 50, "[]", "[]", "notes");
        var saved = repo.save(r);
        assertThat(saved.getId()).isNotNull();
        assertThat(repo.findById(saved.getId())).isPresent();
    }

    @Test
    void shouldFindByUserId() {
        UUID uid = UUID.randomUUID();
        repo.save(new Recipe(uid, "R1", "a", 0,0,0, "[]", "[]", ""));
        repo.save(new Recipe(uid, "R2", "b", 0,0,0, "[]", "[]", ""));
        assertThat(repo.findByUserIdOrderByCreatedAtDesc(uid)).hasSize(2);
    }
}
